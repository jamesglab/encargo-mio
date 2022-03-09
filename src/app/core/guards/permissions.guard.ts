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
    // let access_module: boolean = false;

    // MENU.map((m: any) => {
    //   m.subItems.map((sub: any) => {
    //     if (sub.link && permissions[sub.code]) {
    //       access_module = true;
    //     }
    //   });
    // });

    // if (access_module) {
    //   return true;
    // }
    
    // Swal.fire('Acceso Denegado', 'No dispones de los permisos para acceder a este módulo, si los necesitas contacta con el administrador.', 'info')
    //   .then(() => {
    //     this.router.navigate(['/landing']);
    //     return false;
    //   });
    return true;
  }

}
