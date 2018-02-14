/* global require, Buffer, module */

const crypto = require('crypto');
const scrypt = require('js-scrypt');

const CurrentVersion = 1;
const algorithm = 'aes-256-gcm';

function deriveKey(password, username)
{
    var now = Date.now();
    let ret = scrypt.hashSync(password, username, { maxmem: 4, size: 32 });
    // var ret = Buffer.alloc(32);
    // Buffer.from(password, 'utf8').copy(
    console.log("deriveKey took", Date.now() - now);
    return ret;
}

module.exports = {
    decode: function (string) {
        let buffer = Buffer.from(string, 'base64');
        if (buffer.length <= 4 + 16 + 16 + 16)
            return undefined;
        const version = buffer.readUInt32BE(0);
        if (version != CurrentVersion)
            return undefined;
        return {
            version: version,
            scryptSalt: buffer.slice(4, 20),
            iv: buffer.slice(20, 36),
            tag: buffer.slice(36, 52),
            cipherText: buffer.slice(52)
        };
    },
    encode: function (object) {
        let versionBuffer = Buffer.allocUnsafe(4);
        versionBuffer.writeUInt32BE(object.version, 0);
        return Buffer.concat([versionBuffer, object.scryptSalt, object.iv, object.tag, object.cipherText]).toString('base64');
    },
    encrypt: function (password, plainText) {
        var blob = {
            version: CurrentVersion,
            scryptSalt: crypto.randomBytes(16),
            iv: crypto.randomBytes(16)
        };
        const cipher = crypto.createCipheriv(algorithm, deriveKey(password, blob.scryptSalt), blob.iv);
        blob.cipherText = cipher.update(plainText, 'utf8');
        cipher.final();
        blob.tag = cipher.getAuthTag();
        return blob;
    },
    decrypt: function (password, blob) {
        let entries = [];

        const decipher = crypto.createDecipheriv(algorithm, deriveKey(password, blob.scryptSalt), blob.iv);
        decipher.setAuthTag(blob.tag);
        let dec = decipher.update(blob.cipherText, 'utf8');
        decipher.final();
        return dec;
    }
};
