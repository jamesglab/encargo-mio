import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { PurchasesRoutingModule } from './purchases-routing.module';
import { PurchasesComponent } from './purchases.component';
import { TablePurchasesComponent } from './components/table-purchases/table-purchases.component';
import { ModalEditPurchaseComponent } from './components/modal-edit-purchase/modal-edit-purchase.component';
import { LockerEntryComponent } from './components/table-purchases/modals/locker-entry/locker-entry.component';
import { DetailPurchasesComponent } from './components/table-purchases/modals/detail-purchases/detail-purchases.component';
import { IvyCarouselModule } from 'angular-responsive-carousel';

@NgModule({
  declarations: [
    PurchasesComponent,
    TablePurchasesComponent,
    ModalEditPurchaseComponent,
    LockerEntryComponent,
    DetailPurchasesComponent
  ],
  imports: [
    CommonModule,
    PurchasesRoutingModule,
    NgbNavModule,
    NgbModalModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgbDropdownModule,
    DropzoneModule,
    ReactiveFormsModule,
    UIModule,
    WidgetModule,
    NgSelectModule,
    NgbPaginationModule,
    MatPaginatorModule,
    NgbDatepickerModule,
    MatAutocompleteModule,
    IvyCarouselModule
  ]
})

export class PurchasesModule { }
