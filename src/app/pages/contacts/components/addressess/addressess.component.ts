import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-addressess',
  templateUrl: './addressess.component.html',
  styleUrls: ['./addressess.component.scss']
})
export class AddressessComponent implements OnInit {

  public addressess: any[] = [];
  private unsuscribe: Subscription[] = [];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {}

  obtainAddress(): void {
  }

}
