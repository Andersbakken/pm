import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { LoginService } from './login.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app';
    loginRequired = true;

    constructor(private api: ApiService, private login: LoginService) {
        const key = this.login.getKey();
        if (key) {
            this.api.wsConnect(key);
            this.loginRequired = false;
        }
    }
}
