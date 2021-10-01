import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table-purchases',
  templateUrl: './table-purchases.component.html',
  styleUrls: ['./table-purchases.component.scss']
})
export class TablePurchasesComponent implements OnInit {
  @Input() public purchases: [] = [];
  @Output() public editPurchase: EventEmitter<any> = new EventEmitter<any>();
  public isLoading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  selectPurchase(purchase) {
    this.editPurchase.emit(purchase);
  }

}
