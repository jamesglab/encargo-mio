import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { WidgetModule } from '../../shared/widget/widget.module';
import { UIModule } from '../../shared/ui/ui.module';
import { ContactsRoutingModule } from './contacts-routing.module';

import { UserlistComponent } from './userlist/userlist.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ModalUserComponent } from './components/modal-user/modal-user.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UsersgridComponent } from './usersgrid/usersgrid.component';
import { AddressessComponent } from './components/addressess/addressess.component';

@NgModule({
  declarations: [UserlistComponent, ModalUserComponent, UsersgridComponent, AddressessComponent],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    WidgetModule,
    UIModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    MatPaginatorModule,
    MatAutocompleteModule
  ]
})
export class ContactsModule { }
