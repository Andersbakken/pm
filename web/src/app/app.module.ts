import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatInputModule, MatFormFieldModule, MatTableModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './api.service';
import { LoginService } from './login.service';
import { BlobService } from './blob.service';

import { RouterModule, Routes } from '@angular/router';
import { PasswordsComponent } from './passwords/passwords.component';

const appRoutes: Routes =
    [{
        path: 'login',
        component: LoginComponent
    }, {
        path: 'passwords',
        component: PasswordsComponent
    }, {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    }];

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        PasswordsComponent
    ],
    imports: [
        BrowserModule,
        MatButtonModule,
        MatCheckboxModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,

        RouterModule.forRoot(appRoutes)
    ],
    providers: [ApiService, LoginService, BlobService],
    bootstrap: [AppComponent]

})

export class AppModule { }
