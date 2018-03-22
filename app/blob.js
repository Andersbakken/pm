/* global require, Buffer, module */

const crypto = require('crypto');
const scrypt = require('js-scrypt');

const Version = 100;
const NoCipherVersion = 2;
const algorithm = 'aes-256-gcm';
const options = require('@jhanssen/options')('pm');

function deriveKey(password, salt)
{
    var now = Date.now();
    let ret = scrypt.hashSync(password, salt, { maxmem: 4, size: 32, cost: 2 });
    // var ret = Buffer.alloc(32); Buffer.from(password, 'utf8').copy(
    console.log("deriveKey took", Date.now() - now);
    return ret;
}

module.exports = {
    decode: function (string) {
        let buffer = Buffer.from(string, 'base64');
        if (buffer.length <= 4 + 16 + 16 + 16)
            return undefined;
        const version = buffer.readUInt32BE(0);
        if (version != Version && version != NoCipherVersion)
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
        var blob = {};
        if (options("cipher") === false) {
            blob.version = NoCipherVersion;
            blob.cipherText = Buffer.from(plainText, 'utf8');
            blob.scryptSalt = Buffer.alloc(16);
            blob.iv = Buffer.alloc(16);
            blob.tag = Buffer.alloc(16);
        } else {
            blob.version = Version;
            blob.scryptSalt = crypto.randomBytes(16);
            blob.iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm, deriveKey(password, blob.scryptSalt), blob.iv);
            blob.cipherText = cipher.update(plainText, 'utf8');
            cipher.final();
            blob.tag = cipher.getAuthTag();
        }
        return blob;
    },
    decrypt: function (password, blob) {
        if (blob.version == Version) {
            const decipher = crypto.createDecipheriv(algorithm, deriveKey(password, blob.scryptSalt), blob.iv);
            decipher.setAuthTag(blob.tag);
            let dec = decipher.update(blob.cipherText, 'utf8');
            decipher.final();
            return dec;
        } else if (blob.version == NoCipherVersion) {
            return blob.cipherText.toString('utf8');
        } else {
            throw new Error("Bad blob version " + blob.version);
        }
    }
};
