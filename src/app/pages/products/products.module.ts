import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { GeneralComponent } from './general/general.component';
import { SearchProductComponent } from './search-product/search-product.component';


@NgModule({
  declarations: [
    GeneralComponent,
    SearchProductComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
