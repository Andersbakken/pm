import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { QueueingSubject } from 'queueing-subject'
import websocketConnect from 'rxjs-websockets'
import 'rxjs/add/operator/map'

@Injectable()
export class ApiService {
    private input = new QueueingSubject<string>();

    constructor(private http: HttpClient)
    {
    }

    private makeRequest(path: string, query: string)
    {
        console.log("making request", `http://localhost:8090${path}?${query}`);
        return this.http.get(`http://localhost:8090${path}?${query}`).map((res: Response) => res.json());
    }

    authorize(id: string, sms: string)
    {
        this.makeRequest("/authenticate/create", `id=${id}&user=${sms}`).subscribe(data => { console.log("got data", data); });
    }

    wsConnect()
    {
        const { messages, connectionStatus } = websocketConnect(`ws://localhost:8090/ws`, this.input)
        connectionStatus.subscribe(connected => {
            console.log("connected", connected);
        });
        messages.subscribe((message: string) => {
            console.log("message", message);
        });
    }
}
