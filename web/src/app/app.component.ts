import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { LoginService } from './login.service';
import { BlobService } from './blob.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app';
    loginRequired = true;

    constructor(private api: ApiService, private login: LoginService, private blob: BlobService) {
        this.blob.decodeBlob('foobar123', 'AAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFt7InVzZXIiOiJhZ2Jha2tlbkBnbWFpbC5jb20iLCJob3N0IjoiZ21haWwuY29tIiwicmV2aXNpb24iOjEsImxlbmd0aCI6MTUsInRyYW5zZm9ybSI6InByaW50YWJsZTk0In1d');
        const key = this.login.getKey();
        if (key) {
            this.api.wsConnect(key);
            this.loginRequired = false;
        }
    }
}
