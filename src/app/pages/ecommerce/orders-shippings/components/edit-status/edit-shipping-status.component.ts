import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderShippingService } from '../../_services/order-shipping.service';
import { NotifyService } from 'src/app/_services/notify.service';
import { SHIPPING_STATUS } from 'src/app/_helpers/tools/utils.tool';

@Component({
  selector: 'app-edit-shipping-status',
  templateUrl: './edit-shipping-status.component.html',
  styleUrls: ['./edit-shipping-status.component.scss']
})
export class EditShippingStatusComponent implements OnInit {

  @Input() public shipping: { [key: string]: any } = null;
  @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  public SHIPPING_STATUS: { [key: string]: any }[] = SHIPPING_STATUS;
  public shippingForm: FormGroup = null; 

  public isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(private modal: NgbModal, private fb: FormBuilder,
    private orderShippingService: OrderShippingService, private notification: NotifyService,) { }

  ngOnInit(): void { this.buidForm(); }

  buidForm(): void {
    this.shippingForm = this.fb.group({
      id: [this.shipping.id],
      status: [parseInt(this.shipping.status), [Validators.required]]
    })
  }

  close(): void { this.modal.dismissAll(); }

  onSubmit(): void {
    if (this.shippingForm.invalid) {
      return;
    }
    this.isLoading = true;
    const updateSubscr = this.orderShippingService.updateShippingStatus(this.shippingForm.getRawValue())
      .subscribe(res => {
        this.isLoading = false;
        this.onClose.emit(true);
        this.notification.show(`Envío actualizado`, res.message, "success");
        this.close();
      },
        err => { this.isLoading = false; throw err; })
    this.unsubscribe.push(updateSubscr);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
