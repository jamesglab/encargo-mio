import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionsGuard } from '../core/guards/permissions.guard';
import { LandingInitComponent } from './landing-init/landing-init.component';

const routes: Routes = [
  { path: '', redirectTo: 'landing' },
  { path: 'landing', component: LandingInitComponent },
  { path: 'ecommerce', loadChildren: () => import('./ecommerce/ecommerce.module').then(m => m.EcommerceModule), canActivate: [PermissionsGuard] },
  { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule), canActivate: [PermissionsGuard]},
  { path: 'cupons', loadChildren: () => import('./cupons/cupons.module').then(m => m.CuponsModule), canActivate: [PermissionsGuard] },
  { path: 'contacts', loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule), canActivate: [PermissionsGuard] },
  { path: 'fragment', loadChildren: () => import('./fragment/fragment.module').then(m => m.FragmentModule) },
  { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule), canActivate: [PermissionsGuard] },
  { path: 'purchases', loadChildren: () => import('./purchases/purchases.module').then(m => m.PurchasesModule), canActivate: [PermissionsGuard] },
  { path: 'lockers', loadChildren: () => import('./lockers/lockers.module').then(m => m.LockersModule), canActivate: [PermissionsGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PagesRoutingModule { }
