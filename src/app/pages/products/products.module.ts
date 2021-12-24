import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { GeneralComponent } from './general/general.component';
import { SearchProductComponent } from './search-product/search-product.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { IvyCarouselModule } from 'angular-responsive-carousel';

@NgModule({
  declarations: [
    GeneralComponent,
    SearchProductComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    UIModule,
    IvyCarouselModule
  ]
})
export class ProductsModule { }
