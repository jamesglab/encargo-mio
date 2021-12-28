import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbNavModule, NgbDropdownModule, NgbModalModule, NgbTooltipModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';

import { WidgetModule } from '../shared/widget/widget.module';
import { UIModule } from '../shared/ui/ui.module';

import { PagesRoutingModule } from './pages-routing.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { ContactsModule } from './contacts/contacts.module';
import { TablesModule } from './tables/tables.module';
import { HttpClientModule } from '@angular/common/http';
import { LandingInitComponent } from './landing-init/landing-init.component';

@NgModule({
  declarations: [
    LandingInitComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbModalModule,
    PagesRoutingModule,
    ReactiveFormsModule,
    EcommerceModule,
    HttpClientModule,
    UIModule,
    ContactsModule,
    TablesModule,
    WidgetModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbCollapseModule,
    SimplebarAngularModule
  ]
})

export class PagesModule { }
