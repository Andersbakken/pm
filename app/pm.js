#!/usr/bin/env node

const WebSocket = require('ws');
const options = require('@jhanssen/options')('pm');
const transform = require('./transform');
const generator = require('./generator');
const prompt = require('prompt');
const safe = require('safetydance');
const blob = require('./blob');

let last = Date.now();
function timeStamp(tag)
{
    let now = Date.now();
    console.log(tag, now - last);
    last = Date.now();
}
timeStamp("global");
/* global require, process */
module.exports = () => {
    timeStamp("exports");
    // blob.test();
    // process.exit();
    prompt.message = '';
    prompt.start();

    function read(name, opts)
    {
        return new Promise((resolve, reject) => {
            const value = options(name);
            if (value) {
                resolve(value);
                return;
            }

            var schema = { properties: { } };
            schema.properties[name] = {
                required: true
            };
            if (opts) {
                for (let key in opts) {
                    schema.properties[name][key] = opts[key];
                }
            }
            prompt.get(schema, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[name]);
                }
            });
        });
    };

    let params = { password: undefined, components: {} };
    let transformer;
    let server = options('server');
    if (server[server.length - 1] == '/') {
        server += 'ws';
    } else if (!/\/ws$/.test(server)) {
        server += '/ws';
    }
    let ws;

    read('user').then(result => {
        params.components.user = result;
        return read('host');
    }).then(result => {
        params.components.host = result;
        return read('revision', { default: "1", pattern: /^[0-9]+$/ });
    }).then(result => {
        params.components.revision = parseInt(result);
        return read('password', { hidden: true });
    }).then(result => {
        params.password = result;
        return read('length', { default: "12", pattern: /^[0-9]+$/ });
    }).then(result => {
        params.components.length = parseInt(result);
        return read('transform', { default: 'printable94' });
    }).then(result => {
        transformer = result;
        const binary = generator(params);
        const out = transform(result)(binary, params.components.length);
        console.log(out);
        if (server) {
            return read("upload", { message: `upload to ${server}`, default: "y", pattern: /^[YyNn]/ });
        }
        process.exit();
    }).then(upload => {
        if (upload !== true && upload !== 'y' && upload !== 'Y')
            process.exit();
        return read("cookie");
    }).then(cookie => {
        timeStamp("createWS");
        ws = new WebSocket(server);
        ws.on('open', () => {
            timeStamp("ws opened");
            console.log("got open, sending login");
            ws.send(JSON.stringify({ type: "login", key: cookie}));
        });

        ws.on('message', msgText => {
            var msg = safe.JSON.parse(msgText);
            if (msg === undefined) {
                console.log("Bad json", msg);
                return;
            }
            // console.log("got message", msg);
            switch (msg.type) {
            case 'blob':
                timeStamp("ws got blob");
                let entries;
                // console.log("got blob", msg.blob);
                if (msg.blob.length) {
                    var b = blob.decode(msg.blob);
                    timeStamp("ws got decoded");
                    if (!b) {
                        console.error("Can't decode blob");
                    } else {
                        let plainText = blob.decrypt(params.password, b);
                        timeStamp("ws got decrypted");
                        entries = safe.JSON.parse(plainText) || [];
                        timeStamp("ws got JSON.parsed");
                    }
                }

                if (entries) {
                    // console.log("got entries", entries);
                    for (let i=0; i<entries.length; ++i) {
                        if (entries[i].user == params.components.user && entries[i].host == params.components.host) {
                            if (entries[i].revision == params.components.revision
                                && entries[i].length == params.components.length
                                && entries[i].transform == transformer) { // same, nothing to do
                                process.exit();
                            }
                            entries.splice(i, 1);
                            break;
                        }
                    }
                    timeStamp("ws entries searched");
                } else {
                    entries = [];
                }
                entries.push({ user: params.components.user,
                               host: params.components.host,
                               revision: params.components.revision,
                               length: params.components.length,
                               transform: transformer });
                b = blob.encrypt(params.password, JSON.stringify(entries));
                timeStamp("ws got encrypted");
                // console.log("Made blob", b, blob.encode(b));
                ws.send(JSON.stringify({type: 'update', blob: blob.encode(b)}));
                timeStamp("ws got sent");
                ws.close();
            }
        });

        ws.on('error', (err) => {
            console.error(err);
            throw err;
        });
    }).catch(error => {
        if (error.message !== 'canceled')
            console.error('Got error', error);
        console.log('\n');
        process.exit(1);
    });
};
