#!/usr/bin/env node

const WebSocket = require('ws');
const options = require('@jhanssen/options')('pm');
const transform = require('./transform');
const generator = require('./generator');
const prompt = require('prompt');
const safe = require('safetydance');

/* global require, process */
module.exports = () => {
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

    var params = { password: undefined, components: {} };
    const server = options('server');
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
        const binary = generator(params);
        const out = transform(result)(binary, params.components.length);
        console.log('password:\n', out);
        console.log(server);
        if (server) {
            return read("upload", { message: `upload to ${server}`, default: "y", pattern: /^[YyNn]/ });
        }
        process.exit();
    }).then(upload => {
        if (upload !== true && upload !== 'y' && upload !== 'Y')
            process.exit();
        return read("cookie");
    }).then(cookie => {
        ws = new WebSocket(server, { headers: { "x-pm-key": cookie }});
        ws.on('open', () => {
            console.log("got open");
        });

        ws.on('message', msg => {
            var message = safe.JSON.parse(msg);
            if (message === undefined) {
                console.log("Bad json", msg);
                return;
            }
            switch (message.type) {
            case 'blob':
                var entries = Blob.decrypt(Buffer.from(message.blob, 'base64'));
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
