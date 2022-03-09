import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { MENU } from 'src/app/layouts/sidebar/menu';
import { StorageService } from 'src/app/_services/storage.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

export class PermissionsGuard implements CanActivate {

  constructor(
    private router: Router,
    private authenticationService: StorageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // const permissions = this.authenticationService.getItem('permissions');
    // let access_module = false;

    // const permissions = this.authenticationService.getItem('permissions');
    // let access_module = false;

    // MENU.map(m => {
    //   m.subItems.map(sub => {
    //     if (sub.link == state.url && permissions[sub.code]) {
    //       access_module = true;
    //     }
    //   });
    // });

    // if (access_module || state.url.split("/")[2] == "addressess" || state.url.split("/")[2].includes('?')) { // El parámetro de ? es porque cuando se envien ids a través de query params no lo devuelva a landing
    //   return true; //ESTO ES POR QUE ADDRESSESS NO NECESITA SER RENDERIZADO EN LA SIDE BAR
    // }
    // Swal.fire('Acceso Denegado', 'No dispones de los permiso para acceder a este módulo. Contacta con el administrador.', 'info').then(r => {
    //   this.router.navigate(['/landing']);
    //   return false;
    // });
    return true;
  }

}
