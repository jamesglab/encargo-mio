import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LockersRoutingModule { }
