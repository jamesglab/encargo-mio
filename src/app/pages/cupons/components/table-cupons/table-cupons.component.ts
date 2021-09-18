import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table-cupons',
  templateUrl: './table-cupons.component.html',
  styleUrls: ['./table-cupons.component.scss']
})
export class TableCuponsComponent implements OnInit {
  @Input() cupons;
  @Output() selectCuponEmit = new EventEmitter<any>();
  isLoading: boolean;
  constructor() { }

  ngOnInit(): void {
  }

  selectCupon(cupon) {
    this.selectCuponEmit.emit(cupon);
  }

}
