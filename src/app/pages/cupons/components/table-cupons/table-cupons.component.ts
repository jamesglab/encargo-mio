import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table-cupons',
  templateUrl: './table-cupons.component.html',
  styleUrls: ['./table-cupons.component.scss']
})

export class TableCuponsComponent implements OnInit {

  @Input() public cupons;
  @Output() public selectCuponEmit = new EventEmitter<any>();

  public isLoading: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  selectCupon(cupon) {
    this.selectCuponEmit.emit(cupon);
  }

}
