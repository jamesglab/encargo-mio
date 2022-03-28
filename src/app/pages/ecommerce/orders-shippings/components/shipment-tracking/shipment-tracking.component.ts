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
    if (!this.shipping_order.conveyor && !this.shipping_order.international_conveyor) {
      this.showNoConveyor = true;
    } else {
      this.updateConveyorStatus();
    }
  }

  updateConveyorStatus(): void {
    const { id, conveyor, guide_number_alph,
      international_conveyor, international_guide_number_alph } = this.shipping_order;
    this.isLoadingData = true;
    this._orderService.updateStatusConveyor({ shipping: { id, conveyor, guide_number_alph } })
      .subscribe((res) => {
        const { updated_status } = res;
        this.isLoadingData = false;
        if (updated_status) {
          this.shipping_order.conveyor_status = updated_status;
        } else {
          this.shipping_order.conveyor_status = JSON.parse(this.shipping_order.conveyor_status) || [];
        }
      }, err => { this.isLoadingData = false; throw err; })
  }

  closeModale() {
    this._moodalService.dismissAll();
  }

  getDetailUrl(guide_number: { [key: string]: string }, type: string) {
    if (type === '1') {
      return `https://www.servientrega.com/wps/portal/rastreo-envio/detalle/!ut/p/z1/
      04_Sj9CPykssy0xPLMnMz0vMAfIjo8ziLQ1NTDwMnA38_Z2CnQ0Czd2dnAw83Q0MfA31w8EKDHAARwP9KGL041EQhd_4cP0osBJTC0-gCSaG_u5-
      LiYGgUFORr5-ho6exp4GeBUYOfoaQRXgsaQgNzTCINNTEQAH765M/dz/d5/L2dBISEvZ0FBIS9nQSEh/?id=${guide_number}&tipo=0`;
    } else {
      return `https://solucionservientrega.com/(S(zm05b1saoddxnzesflpm2jcn))/TrackEnvios.aspx?ID=${guide_number}`;
    }
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
