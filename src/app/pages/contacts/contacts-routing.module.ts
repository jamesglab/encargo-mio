import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddressessComponent } from './components/addressess/addressess.component';

import { UserlistComponent } from './userlist/userlist.component';
import { UsersgridComponent } from './usersgrid/usersgrid.component';

const routes: Routes = [
    {
        path: 'list',
        component: UserlistComponent
    },
    {
        path: 'grid',
        component: UsersgridComponent
    },
    {
        path: 'addressess/:id',
        component: AddressessComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ContactsRoutingModule { }
