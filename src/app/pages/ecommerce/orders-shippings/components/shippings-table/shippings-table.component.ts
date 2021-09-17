import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderService } from '../../../_services/orders.service';

@Component({
  selector: 'app-shippings-table',
  templateUrl: './shippings-table.component.html',
  styleUrls: ['./shippings-table.component.scss']
})
export class ShippingsTableComponent implements OnInit {
  @Input() transactions;
  @Output() shippingSelected = new EventEmitter<any>();
  isLoading: boolean;
  constructor(
    private readonly _orderService: OrderService,
  ) { }

  ngOnInit(): void {
  }

  openModal() {

  }

  getOrderById(id) {
    this.isLoading = true;
    this._orderService.getShippingById({ id }).subscribe(res => {
      this.isLoading = false;
      this.shippingSelected.emit(res);
      // falta crear componente y enviar informacion a un modale
    })
  }
}
