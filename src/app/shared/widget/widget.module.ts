import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { StatComponent } from './stat/stat.component';
import { TransactionComponent } from './transaction/transaction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalEditOrderComponent } from './transaction/modals/modal-edit-order/modal-edit-order.component';
import { ModalRegisterPurchaseComponent } from './transaction/modals/modal-register-purchase/modal-register-purchase.component';
import { CreateImageComponent } from './transaction/modals/create-image/create-image.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [StatComponent, TransactionComponent,
    ModalEditOrderComponent, ModalRegisterPurchaseComponent,
    CreateImageComponent],
  imports: [
    CommonModule,
    NgbModalModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
  ],
  exports: [StatComponent, TransactionComponent],
  providers: [NgxImageCompressService]
})

export class WidgetModule { }
