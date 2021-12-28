import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralComponent } from './general/general.component';
import { SearchProductComponent } from './search-product/search-product.component';

const routes: Routes = [
  {
    path: 'all',
    component: GeneralComponent
  },
  {
    path: 'search',
    component: SearchProductComponent
  },
  {
    path: '',
    redirectTo: 'all'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
