import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LockersRoutingModule } from './lockers-routing.module';
import { LockerComponent } from './components/locker/locker.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatPaginatorModule } from '@angular/material/paginator';
import { LockersTableComponent } from './components/lockers-table/lockers-table.component';
import { ModalEditLockersComponent } from './modals/modal-edit-lockers/modal-edit-lockers.component';

@NgModule({
  declarations: [
    LockerComponent,
    LockersTableComponent,
    ModalEditLockersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LockersRoutingModule,
    UIModule,
    MatPaginatorModule,
    Ng2SearchPipeModule
  ]
})

export class LockersModule { }
