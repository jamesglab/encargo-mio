import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CuponsComponent } from './create-cupons/cupons.component';

const routes: Routes = [
  {
    path: '',
    component: CuponsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CuponsRoutingModule { }
