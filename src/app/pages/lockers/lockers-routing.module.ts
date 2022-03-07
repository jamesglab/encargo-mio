import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsertInLockerComponent } from './components/insert-in-locker/insert-in-locker.component';
import { LockerUpdateComponent } from './components/locker-update/locker-update.component';
import { LockerComponent } from './components/locker/locker.component';
import { UsersProductsComponent } from './components/users-products/users-products.component';

const routes: Routes = [
  {
    path: 'locker',
    component: LockerComponent
  },
  {
    path: 'user-products',
    component: UsersProductsComponent
  },
  {
    path: 'insert-in-locker',
    component: InsertInLockerComponent
  },
  {
    path: 'update-locker',
    component: LockerUpdateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LockersRoutingModule { }
