#!/usr/bin/env node

/* global require, process */

const options = require('@jhanssen/options')('pm');
const gpg = require('gpg');

const prompt = require('prompt');
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
        schema.properties[name] = { required: true, hidden: opts && opts.hidden };
        prompt.get(schema, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[name]);
            }
        });
    });
};


var user, host, password;
read('user').then(resultUser => {
    user = resultUser;
    return read('host');
}).then(resultHost => {
    host = resultHost;
    return read('password', { hidden: true });
}).then(resultPassword => {
    password = resultPassword;
}).then(() => {
    console.log('user', user, 'host', host, 'password', password);
}).catch(error => {
    console.error('Got error', error.message);
    process.exit(1);
});



