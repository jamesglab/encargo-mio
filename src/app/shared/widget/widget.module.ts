import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { StatComponent } from './stat/stat.component';
import { TransactionComponent } from './transaction/transaction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalEditOrderComponent } from './transaction/modals/modal-edit-order/modal-edit-order.component';
import { ModalRegisterPurchaseComponent } from './transaction/modals/modal-register-purchase/modal-register-purchase.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ImageDragDirective } from 'src/app/_directives/image-drag.directive';
import { IvyCarouselModule } from 'angular-responsive-carousel';

@NgModule({
  declarations: [StatComponent, TransactionComponent,
    ModalEditOrderComponent, ModalRegisterPurchaseComponent,
    ImageDragDirective, ImageDragDirective],
  imports: [
    CommonModule,
    NgbModalModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    MatAutocompleteModule,
    IvyCarouselModule
  ],
  exports: [StatComponent, TransactionComponent, ImageDragDirective],
  providers: [NgxImageCompressService]
})

export class WidgetModule { }
