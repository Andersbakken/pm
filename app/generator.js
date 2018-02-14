/* global require, module, Buffer */

'use strict';
const crypto = require('crypto');

module.exports = function(params) {
    var buffers = [];
    for (let key in params.components) {
        if (buffers.length)
            buffers.push(Buffer.from([0]));
        buffers.push(Buffer.from(params.components[key].toString(), 'utf8'));
    }
    var input = Buffer.concat(buffers);
    let hash = crypto.createHmac('sha512', params.password);
    hash.update(input);
    return hash.digest();
};


