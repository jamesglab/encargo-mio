import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FragmentComponent } from './fragment.component';

const routes: Routes = [
  { path: ':id', component: FragmentComponent } //CREAMOS LA RUTA CON ID PARAMS PARA OBETNER EL ID DE LA ORDEN QUE VAMOS A CONSULTAR
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FragmentRoutingModule { }
