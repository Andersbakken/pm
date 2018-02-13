/* global module */

'use strict';

function alphabet(chars)
{
    return function(buffer, length) {
        if (chars.length > 256) {
            chars = chars.substr(0, 256);
        }
        let ret = '';
        let count = Math.floor(256 / chars.length) * chars.length;
        for (let i=0; i<buffer.length; ++i) {
            let val = buffer[i];
            if (val > count)
                continue;
            let idx = val % chars.length;
            ret += chars[idx];
            if (ret.length == length)
                break;
        }
        return ret;
    };
}

module.exports = function(transform) {
    switch (transform) {
    case 'base64':
        return function (buffer, length) {
            return buffer.toString('base64').substr(0, length);
        };
    case 'printable94':
        let a = '';
        for (let i=0; i<94; ++i) {
            a += String.fromCharCode(33+i);
        }

        return alphabet(a);
    case 'alphanumeric':
        return alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy0123456789');
    case transform instanceof RegExp:
        let s = '';
        for (let i=0; i<256; i++) {
            if (transform.test(String.fromCharCode(i)))
                s += String.fromCharCode(i);
        }

        return alphabet(s);
    default:
        return alphabet(transform);
    }
};
