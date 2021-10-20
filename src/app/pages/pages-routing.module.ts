import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { PermissionsGuard } from '../core/guards/permissions.guard';
import { LandingInitComponent } from './landing-init/landing-init.component';


const routes: Routes = [
  { path: '', redirectTo: 'landing' },
  { path: 'landing', component: LandingInitComponent },
  { path: 'ecommerce', loadChildren: () => import('./ecommerce/ecommerce.module').then(m => m.EcommerceModule), canActivate: [PermissionsGuard] },
  { path: 'cupons', loadChildren: () => import('./cupons/cupons.module').then(m => m.CuponsModule), canActivate: [PermissionsGuard] },
  { path: 'tasks', loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule), canActivate: [PermissionsGuard] },
  { path: 'contacts', loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule), canActivate: [PermissionsGuard] },
  { path: 'fragment', loadChildren: () => import('./fragment/fragment.module').then(m => m.FragmentModule), canActivate: [PermissionsGuard] },
  { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule), canActivate: [PermissionsGuard] },
  { path: 'purchases', loadChildren: () => import('./purchases/purchases.module').then(m => m.PurchasesModule), canActivate: [PermissionsGuard] },
  { path: 'lockers', loadChildren: () => import('./lockers/lockers.module').then(m => m.LockersModule), canActivate: [PermissionsGuard] }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
