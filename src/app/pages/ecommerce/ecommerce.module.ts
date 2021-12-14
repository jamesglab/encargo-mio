import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { UIModule } from '../../shared/ui/ui.module';
import { WidgetModule } from '../../shared/widget/widget.module';

import { Ng5SliderModule } from 'ng5-slider';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbNavModule, NgbDropdownModule, NgbPaginationModule, NgbModalModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { NgSelectModule } from '@ng-select/ng-select';

import { ProductsComponent } from './products/products.component';
import { ProductdetailComponent } from './productdetail/productdetail.component';
import { ShopsComponent } from './shops/shops.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CartComponent } from './cart/cart.component';
import { AddproductComponent } from './addproduct/addproduct.component';
import { CustomersComponent } from './customers/customers.component';
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
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { ShipmentTrackingComponent } from './orders-shippings/components/shipment-tracking/shipment-tracking.component';
import { OrderByPipe } from './orders-shippings/pipes/sort.pipe';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageDragDirective } from 'src/app/_directives/image-drag.directive';
import { EditShippingStatusComponent } from './orders-shippings/components/edit-status/edit-shipping-status.component';

const config: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  maxFilesize: 100,
};

@NgModule({
  declarations: [
    ProductsComponent,
    ProductdetailComponent, ShopsComponent,
    CheckoutComponent, CartComponent, AddproductComponent,
    CustomersComponent, OrdersComponent, CreateOrderComponent,
    OrdersBuysComponent, OrdersShippingsComponent, ModalCreateShippingComponent,
    ShippingsTableComponent, ModalUpdateShippingComponent, ModalLockerEntryComponent, ShipmentTrackingComponent,
    OrderByPipe,
    EditShippingStatusComponent
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
    Ng5SliderModule,
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
    {
      provide: DROPZONE_CONFIG,
      useValue: config
    },
    NgxImageCompressService
  ]
})

export class EcommerceModule { }
