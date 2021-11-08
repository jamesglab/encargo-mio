import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { OrderService } from '../../../_services/orders.service';

@Component({
  selector: 'app-shipment-tracking',
  templateUrl: './shipment-tracking.component.html',
  styleUrls: ['./shipment-tracking.component.scss']
})
export class ShipmentTrackingComponent implements OnInit {
  @Input() shippingTracking;
  @Output() refreshTable = new EventEmitter<any>()
  isLoadingData: boolean;
  isLoading: boolean;
  constructor(
    private _orderService: OrderService,
    private _moodalService : NgbModal
  ) { }

  ngOnInit(): void {
    if (this.shippingTracking.conveyor_status) {
      this.shippingTracking.conveyor_status = JSON.parse(this.shippingTracking.conveyor_status);
      this.shippingTracking.conveyor_status.reverse();
    }
  }

  closeModale() {
    this._moodalService.dismissAll();
  }

  isDelivered(){
    this._orderService.shippingOrderIsDelivered(this.shippingTracking.id).subscribe(res=>{
      Swal.fire('Actualizada',res.message,'success');
      this.refreshTable.emit(true);
    })
  }

}
