import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    public id: string;
    public phone: string;
    public token: string;
    public waitingForToken = false;

    constructor(private api: ApiService, private login: LoginService) { }

    ngOnInit() {
    }

    authorize() {
        if (this.waitingForToken) {
            this.api.requestKey(this.token, this.phone).subscribe((resp: any) => {
                // console.log("got key", resp);
                this.login.setKey(resp.key);
                this.api.wsConnect(resp.key);
                console.log("login1");
            });
        } else {
            this.api.requestToken(this.id, this.phone).subscribe((resp: any) => {
                this.waitingForToken = resp && resp.ok;
            });
        }
    }

}
