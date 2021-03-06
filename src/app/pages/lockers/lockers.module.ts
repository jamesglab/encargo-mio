import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LockersRoutingModule } from './lockers-routing.module';
import { LockerComponent } from './components/locker/locker.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatPaginatorModule } from '@angular/material/paginator';
import { LockersTableComponent } from './components/lockers-table/lockers-table.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { UsersProductsComponent } from './components/users-products/users-products.component';
import { InsertInLockerComponent } from './components/insert-in-locker/insert-in-locker.component';
import { LockerUpdateComponent } from './components/locker-update/locker-update.component';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { ModalEditLockersComponent } from './modals/modal-edit-lockers/modal-edit-lockers.component';
import { IncomeProductsComponent } from './components/insert-in-locker/income-products/income-products.component';
import { NotIncomeProductsComponent } from './components/insert-in-locker/not-income-products/not-income-products.component';
import { ImageViewComponent } from './components/insert-in-locker/image-view/image-view.component';

@NgModule({
  declarations: [
    LockerComponent,
    LockersTableComponent,
    UsersProductsComponent,
    InsertInLockerComponent,
    LockerUpdateComponent,
    ModalEditLockersComponent,
    IncomeProductsComponent,
    NotIncomeProductsComponent,
    ImageViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LockersRoutingModule,
    UIModule,
    MatPaginatorModule,
    Ng2SearchPipeModule,
    NgxDropzoneModule,
    MatAutocompleteModule,
    MatInputModule,
    NgbDatepickerModule,
    EcommerceModule,
    NgxImageZoomModule,
    IvyCarouselModule
  ]
})

export class LockersModule { }
