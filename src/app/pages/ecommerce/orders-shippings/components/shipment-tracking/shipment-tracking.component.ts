import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { OrderService } from '../../../_services/orders.service';

@Component({
  selector: 'app-shipment-tracking',
  templateUrl: './shipment-tracking.component.html',
  styleUrls: ['./shipment-tracking.component.scss']
})

export class ShipmentTrackingComponent implements OnInit {

  @Input() public shipping_order: any = null;
  @Output() public refreshTable = new EventEmitter<any>()

  public showNoConveyor: boolean = false;
  public isLoadingData: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private _orderService: OrderService,
    private _moodalService: NgbModal
  ) { }

  ngOnInit(): void {
    console.log("SHIPPINGTRACKING", this.shipping_order);
    if (!this.shipping_order.conveyor) {
      this.showNoConveyor = true;
    } else {
      this.updateConveyorStatus();
    }
    // if (this.shipping_order.conveyor_status) {
    //   this.shipping_order.conveyor_status = JSON.parse(this.shipping_order.conveyor_status);
    //   if (this.shipping_order.conveyor_status && this.shipping_order.conveyor_status.length > 0) {
    //     this.shipping_order.conveyor_status.map((item: any) => {
    //       item.date = item.date.trim()
    //     });
    //   }
    // }
  }

  updateConveyorStatus(): void {
    const { id, conveyor, guide_number_alph } = this.shipping_order;
    this.isLoadingData = true;
    this._orderService.updateStatusConveyor({ shipping: { id, conveyor, guide_number_alph } })
      .subscribe((res) => {
        const { updated_status } = res;
        this.isLoadingData = false;
        if(updated_status){
          this.shipping_order.conveyor_status = updated_status;
        } else {
          this.shipping_order.conveyor_status = JSON.parse(this.shipping_order.conveyor_status) || [];
        }
      }, err => { this.isLoadingData = false; throw err; })
  }

  closeModale() {
    this._moodalService.dismissAll();
  }

  isDelivered() {

    Swal.fire({
      title: '¿ Estás seguro ?',
      text: "El envio será actualizado a el estado ENTREGADO",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#556EE6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, actualizar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._orderService.shippingOrderIsDelivered(this.shipping_order.id)
          .subscribe(res => {
            Swal.fire('Envío actualizado',
              res.message,
              'success'
            );
            this.refreshTable.emit(true);
          });
      }
    });

  }

}
