import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

type Data = { host: string, revision: number, password: string, length: number, transform: string };

@Component({
    selector: 'app-passwords',
    templateUrl: './passwords.component.html',
    styleUrls: ['./passwords.component.css']
})

export class PasswordsComponent implements OnInit {
    displayedColumns = ["host", "revision", "length", "transform"];
    dataSource: MatTableDataSource<Data>;

    items: Data[] = [
        { host: "test", revision: 1, password: "123", length: 12, transform: "printable94" },
        { host: "bar", revision: 5, password: "321", length: 12, transform: "printable94" }
    ];

    constructor() {
        this.dataSource = new MatTableDataSource(this.items);
    }

    ngOnInit() {
    }

    onRowClicked(row) {
        console.log("row clicked", row);
    }

}
