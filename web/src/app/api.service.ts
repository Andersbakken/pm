import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { QueueingSubject } from 'queueing-subject'
import { Subject } from 'rxjs/Subject';
import websocketConnect from 'rxjs-websockets'
import 'rxjs/add/operator/map'

@Injectable()
export class ApiService {
    private input = new QueueingSubject<string>();
    public blob: any;

    constructor(private http: HttpClient)
    {
    }

    private makeRequest(path: string, query: string)
    {
        return this.http.get(`http://localhost:8090${path}?${query}`).map((res: Response) => res);
    }

    requestToken(id: string, sms: string)
    {
        return this.makeRequest("/authenticate/create", `id=${id}&user=${sms}`);
    }

    requestKey(token: string, sms: string)
    {
        return this.makeRequest("/authenticate/token", `token=${token}&user=${sms}`);
    }

    wsConnect(key: string)
    {
        console.log("login3");
        const send = obj => {
            this.input.next(JSON.stringify(obj));
        }

        const { messages, connectionStatus } = websocketConnect(`ws://localhost:8090/ws`, this.input)
        connectionStatus.subscribe(connected => {
            if (connected == 1) {
                send({ type: "login", key: key });
            }
        });
        messages.subscribe((message: string) => {
            console.log("message", message);
            const data = JSON.parse(message);
            switch (data.type) {
                case "blob":
                    this.blob = data.blob;
                    // ### change route here
                    break;
            }
        });
    }
}
