import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { StatComponent } from './stat/stat.component';
import { TransactionComponent } from './transaction/transaction.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ModalEditOrderComponent } from './transaction/modals/modal-edit-order/modal-edit-order.component';
import { ModalRegisterPurchaseComponent } from './transaction/modals/modal-register-purchase/modal-register-purchase.component';
import { ModalLockerEntryComponent } from './transaction/modals/modal-locker-entry/modal-locker-entry.component';
@NgModule({
  declarations: [StatComponent, TransactionComponent, ModalEditOrderComponent, ModalRegisterPurchaseComponent, ModalLockerEntryComponent],
  imports: [
    CommonModule,
    NgbModalModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule
  ],
  exports: [StatComponent, TransactionComponent]
})
export class WidgetModule { }
