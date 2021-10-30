import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderService } from '../../../_services/orders.service';

@Component({
  selector: 'app-shippings-table',
  templateUrl: './shippings-table.component.html',
  styleUrls: ['./shippings-table.component.scss']
})

export class ShippingsTableComponent implements OnInit {

  @Input() public shippings = [];
  @Output() public shippingSelected = new EventEmitter<any>();

  public isLoading: boolean;

  constructor(
    private readonly _orderService: OrderService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(){
    console.log(this.shippings);
  }

  openModal() { }

  getOrderById(id) {
    this.isLoading = true;
    this._orderService.getShippingById({ id }).subscribe(res => {
      this.isLoading = false;
      this.shippingSelected.emit(res);
      // falta crear componente y enviar informacion a un modale
    }, err => {
      this.isLoading = false;
      throw err;
    });
  }
}
