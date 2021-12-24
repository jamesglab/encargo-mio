import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProductsRoutingModule } from "./products-routing.module";
import { GeneralComponent } from "./general/general.component";
import { SearchProductComponent } from "./search-product/search-product.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { IvyCarouselModule } from "angular-responsive-carousel";
import { SharedModule } from "src/app/shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import {
  NgbDatepickerModule,
  NgbPaginationModule,
} from "@ng-bootstrap/ng-bootstrap";
import { MatPaginatorModule } from "@angular/material/paginator";
import { ModalOrderComponent } from "./general/modal-components/modal-order/modal-order.component";
import { ModalPurchaseComponent } from "./general/modal-components/modal-purchase/modal-purchase.component";
import { ModalShippingComponent } from "./general/modal-components/modal-update-shipping/modal-shipping.component";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [
    GeneralComponent,
    SearchProductComponent,
    ModalOrderComponent,
    ModalPurchaseComponent,
    ModalShippingComponent,
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    UIModule,
    IvyCarouselModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    NgbDatepickerModule,
    NgbPaginationModule,
    MatPaginatorModule,
    DragDropModule
  ],
})
export class ProductsModule {}
