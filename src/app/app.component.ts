import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  public config: { version: string };

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.authVersion();
  }

  authVersion() {
    this.config = require("../assets/version.json");
    console.log(this.config.version);
    const headers = new HttpHeaders().set('Cache-Control', 'no-cache').set('Pragma', 'no-cache');
    this.httpClient.get<{ version: string }>("/assets/version.json", { headers }).subscribe(config => {
      if (config.version !== this.config.version) {
        location.reload();
      }
    });
  }

}
