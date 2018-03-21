#!/usr/bin/env node

/* global require, Buffer, process */

const options = require('@jhanssen/options')('pm-server');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const ConfigStore = require('configstore');
const crypto = require('crypto');
const uuidv4 = require('uuid/v4');
const safe = require('safetydance');

const conf = new ConfigStore('pm-server');
const users = conf.get('users') || {};
const smtpServer = options("smtp-server");
const tokenTimeout = options.int('token-timeout', 5 * 60 * 1000);
const byUUID = {};

let addUser = options('add-user');
if (addUser) {
    users[addUser] = {};
    conf.set('users', users);
    console.log("Added user", addUser);
    process.exit();
}

for (var user in users) {
    let u = users[user];
    if (u.uuids instanceof Array) {
        u.uuids.forEach(item => {
            byUUID[item.uuid] = user;
        });
    }
}

app.use((req, res, next) => {
    console.log("Request", req.url, req.headers, req.query);
    return next();
});

app.use(express.static("www"));

app.ws('/ws', (ws, req) => {
    let user;
    console.log("got ws", user);
    ws.on('message', function(msgText) {
        var msg = safe.JSON.parse(msgText) || {};
        console.log("got message", msg);
        switch (msg.type) {
        case 'login':
            let key = msg.key;
            console.log("got key", key, Object.keys(byUUID));
            if (!(key in byUUID)) {
                console.error("no key, we're out");
                ws.close();
                break;
            }
            user = byUUID[key];
            ws.send(JSON.stringify({type: 'blob', blob: users[user].blob || ""}));
            break;
        case 'update':
            if (!user) {
                ws.close();
                break;
            }
            console.log("got here", user, msg.blob);
            users[user].blob = msg.blob || "";
            conf.set('users', users);
            break;
        case 'blob':
            if (!user) {
                ws.close();
                break;
            }
            ws.send(JSON.stringify({type: 'blob', blob: users[user].blob || ""}));
            break;
        default:
            console.error("bad message", msgText);
            ws.close();
            break;
        }
    });
});

app.get('/authenticate/create', (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.sendStatus(401);
        return;
    }

    const user = req.query.user;
    let data = users[user];
    if (!data) {
        delete users[user];
        res.sendStatus(401);
        return;
    }

    const now = Date.now();
    if (!data.token || now - data.tokenTimestamp >= tokenTimeout) {
        data.token = crypto.randomBytes(4).toString('hex');
        data.tokenTimestamp = now;
        data.tokenId = id;
    }
    console.log(`send email to user: ${user} with token: ${data.token}: curl -v "http://localhost:${port}/authenticate/token/?user=${user}&token=${data.token}"`);
    // console.log("send email with
    res.sendStatus(200);
});

app.get('/authenticate/token', (req, res) => {
    const user = req.query.user;
    let data = users[user];
    if (!data) {
        delete users[user];
        res.sendStatus(401);
        return;
    }

    const token = req.query.token;
    if (token != data.token || Date.now() - data.tokenTimestamp >= tokenTimeout) {
        res.sendStatus(401);
        return;
    }

    const uuid = uuidv4();
    if (!data.uuids)
        data.uuids = [];
    data.uuids.push({ uuid: uuid, id: data.tokenId });
    byUUID[uuid] = user;
    delete data.token;
    delete data.tokenTimestamp;
    delete data.tokenId;
    conf.set('users', users);

    res.cookie('x-pm-key', uuid, { httpOnly: true, secure: false });
    res.sendStatus(200);
});

const port = options.int('port', 8090);
console.log(`listening on ${port}`);
app.listen(port);
