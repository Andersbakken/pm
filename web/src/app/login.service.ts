import { Injectable } from '@angular/core';

@Injectable()
export class LoginService {

    constructor() { }

    setKey(key: string)
    {
        localStorage.setItem("pm-key", key);
    }

    getKey()
    {
        return localStorage.getItem("pm-key");
    }

    removeKey()
    {
        localStorage.removeItem("pm-key");
    }

}
