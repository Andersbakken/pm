import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    public id: string;
    public phone: string;

    constructor(private api: ApiService) { }

    ngOnInit() {
    }

    authorize() {
        this.api.authorize(this.id, this.phone);
    }

}
