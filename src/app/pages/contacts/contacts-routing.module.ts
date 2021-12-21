import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ContactsRoutingModule { }
