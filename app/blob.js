/* global require, Buffer, module */

const crypto = require('crypto');

const CurrentVersion = 1;
const algorithm = 'aes-256-gcm';
module.exports = {
    encrypt: function (password, string) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, password, iv);
        var update = cipher.update(string, 'utf-8', 'binary');
        var final = cipher.final('binary');
        var tag = cipher.getAuthTag();
        var versionBuffer = Buffer.allocUnsafe(4);
        versionBuffer.writeUInt32BE(0, CurrentVersion);
        return Buffer.concat([versionBuffer, iv, tag, update, final]).toString('base64');
    },
    decrypt: function (password, string) {
        let entries = [];
        var buffer = Buffer.from(string, 'base64');
        if (buffer.length <= 4 + 16 + 16)
            return undefined;
        const version = buffer.readUInt32BE(0);
        if (version != CurrentVersion)
            return undefined;

        const iv = buffer.slice(4, 20);
        const tag = buffer.slice(20, 36);
        const cipherText = buffer.slice(36);
        const decipher = crypto.createDecipheriv(algorithm, password, iv);
        decipher.setAuthTag(tag);
        var dec = decipher.update(cipherText, 'binary', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
};
