import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIModule } from '../../shared/ui/ui.module';
import { WidgetModule } from '../../shared/widget/widget.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbNavModule, NgbDropdownModule, NgbPaginationModule, NgbModalModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { NgSelectModule } from '@ng-select/ng-select';
import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { OrdersComponent } from './orders/orders.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CreateOrderComponent } from './orders/components/create-order/create-order.component';
import { OrdersBuysComponent } from './orders-buys/orders-buys.component';
import { OrdersShippingsComponent } from './orders-shippings/orders-shippings.component';
import { ModalCreateShippingComponent } from './orders-shippings/components/modal-create-shipping/modal-create-shipping.component';
import { ShippingsTableComponent } from './orders-shippings/components/shippings-table/shippings-table.component';
import { ModalUpdateShippingComponent } from './orders-shippings/components/modal-update-shipping/modal-update-shipping.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalLockerEntryComponent } from 'src/app/shared/widget/transaction/modals/modal-locker-entry/modal-locker-entry.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ShipmentTrackingComponent } from './orders-shippings/components/shipment-tracking/shipment-tracking.component';
import { OrderByPipe } from './orders-shippings/pipes/sort.pipe';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageDragDirective } from 'src/app/_directives/image-drag.directive';
import { EditShippingStatusComponent } from './orders-shippings/components/edit-status/edit-shipping-status.component';
import { CustomersComponent } from './customers/customers.component';

@NgModule({
  declarations: [
    OrdersComponent, CreateOrderComponent,
    OrdersBuysComponent, OrdersShippingsComponent, ModalCreateShippingComponent,
    ShippingsTableComponent, ModalUpdateShippingComponent, ModalLockerEntryComponent, ShipmentTrackingComponent,
    OrderByPipe, EditShippingStatusComponent, CustomersComponent
  ],
  imports: [
    CommonModule,
    EcommerceRoutingModule,
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
    NgxDropzoneModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    SharedModule,
    DragDropModule
  ],
  exports: [
    MatSelectModule,
    MatAutocompleteModule,
    ModalLockerEntryComponent,
    ImageDragDirective
  ],
  providers: [
    NgxImageCompressService
  ]
})

export class EcommerceModule { }
