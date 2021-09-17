import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-shippings-table',
  templateUrl: './shippings-table.component.html',
  styleUrls: ['./shippings-table.component.scss']
})
export class ShippingsTableComponent implements OnInit {
  @Input() transactions;
  constructor() { }

  ngOnInit(): void {
  }

  openModal(){
    
  }
}
