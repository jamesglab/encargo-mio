import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LockerComponent } from './components/locker/locker.component';

const routes: Routes = [
  {
    path: 'locker',
    component: LockerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LockersRoutingModule { }
