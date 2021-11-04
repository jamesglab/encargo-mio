import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-table-purchases',
  templateUrl: './table-purchases.component.html',
  styleUrls: ['./table-purchases.component.scss']
})
export class TablePurchasesComponent implements OnInit {

  @Input() public purchases: [] = [];
  @Input() public count: number = 0;
  @Output() public editPurchase: EventEmitter<any> = new EventEmitter<any>();
  @Output() public filterData: EventEmitter<any> = new EventEmitter<any>();

  public isLoading: boolean = false;

  public filterCode = new FormControl('');
  public filterDate = new FormControl('');
  public productDetail = new FormControl('');
  public purchaseNumber = new FormControl('');
  public total_value = new FormControl('');





  constructor() { }

  ngOnInit(): void {
  }

  selectPurchase(purchase) {
    this.editPurchase.emit(purchase);
  }

  filterPurchase() {

  }

  emitPage($event){
    this.filterData.emit($event)

  }
}
