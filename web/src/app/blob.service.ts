import { Injectable } from '@angular/core';

@Injectable()
export class BlobService {

    constructor() { }

    arrayBufferToBase64(buffer:ArrayBuffer)
    {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i=0; i<len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    base64ToArrayBuffer(base64:string)
    {
        let binary_string = window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i=0; i<len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    Version = 100;
    NoCipherVersion = 2;

    decodeBlob(password: string, blob: string)
    {
        let data = this.base64ToArrayBuffer(blob);
        let dataView = new DataView(data);
        let version = dataView.getUint32(0);
        var typed = new Uint8Array(data);
        let plainText;
        switch (version) {
            case this.Version:
                // let result = crypto.subtle.decrypt({name: "AES-GCM", iv: typed.slice(20, 36), tagLength: 16 });
                break;
            case this.NoCipherVersion:
                plainText = '';
                var len = data.byteLength;
                for (let i=52; i<data.byteLength; ++i) {
                    plainText += String.fromCharCode(typed[i]);
                }
                break;
        }
        let ret = JSON.parse(plainText);
        console.log(ret);
        return ret;
        // if (version ==
    }
}
