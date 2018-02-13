#!/usr/bin/env node

/* global require, process */

const options = require('@jhanssen/options')('pm');
const gpg = require('gpg');
const transform = require('./transform');
const generator = require('./generator');

const prompt = require('prompt');
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
    params.length = parseInt(result);
    return read('transform', { default: 'printable94' });
}).then(result => {
    const binary = generator(params);
    const out = transform(result)(binary, params.length);
    console.log('password:\n', out);
    // console.log('user', user, 'host', host, 'password', password);
}).catch(error => {
    console.error('Got error', error);
    process.exit(1);
});



