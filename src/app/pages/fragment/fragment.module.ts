import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FragmentRoutingModule } from './fragment-routing.module';
import { FragmentComponent } from './fragment.component';


@NgModule({
  declarations: [
    FragmentComponent
  ],
  imports: [
    CommonModule,
    FragmentRoutingModule
  ]
})
export class FragmentModule { }
