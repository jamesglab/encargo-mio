import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdersComponent } from './orders/orders.component';
import { OrdersBuysComponent } from './orders-buys/orders-buys.component';
import { OrdersShippingsComponent } from './orders-shippings/orders-shippings.component';

const routes: Routes = [
    {
        path: 'orders',
        component: OrdersComponent
    },
    {
        path: 'orders-buy',
        component: OrdersBuysComponent
    },
    {
        path: 'orders-shippings',
        component: OrdersShippingsComponent
    },
    {
        path: '',
        redirectTo: 'orders'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class EcommerceRoutingModule { }
