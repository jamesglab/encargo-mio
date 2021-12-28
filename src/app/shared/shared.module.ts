import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from './ui/ui.module';
import { WidgetModule } from './widget/widget.module';
import { IvyCarouselModule } from 'angular-responsive-carousel';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UIModule,
    WidgetModule,
    IvyCarouselModule
  ],
  exports: [
    IvyCarouselModule
  ]
})

export class SharedModule { }
