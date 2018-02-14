#!/usr/bin/env node

/* global require, Buffer, process */

const options = require('@jhanssen/options')('pm-server');
const app = require('express')();
const expressWs = require('express-ws')(app);
const ConfigStore = require('configstore');
const crypto = require('crypto');
const uuidv4 = require('uuid/v4');

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

app.ws('/ws', (ws, req) => {
    let key = req.headers["x-pm-key"];
    console.log("got key", key, Object.keys(byUUID));

    if (!(key in byUUID)) {
        console.error("no key, we're out");
        ws.close();
        return;
    }
    const user = byUUID[key];
    console.log("got ws", req.headers, user);
    ws.send(JSON.stringify({type: 'blob', blob: users[user].blob || ""}));
    ws.on('message', function(msg) {
        console.log("got message", msg);
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
