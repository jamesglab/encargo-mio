import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MENU } from 'src/app/layouts/sidebar/menu';
import { StorageService } from 'src/app/_services/storage.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: StorageService,

  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const permissions = this.authenticationService.getItem('permissions');
    let access_module = false;
    MENU.map(m => {
      m.subItems.map(sub => {
        if (sub.link == state.url && permissions[sub.code]) {
          access_module = true;
        }
      });
    })
    if (access_module) {
      return true;
    }
    Swal.fire('Acceso Denegado', 'Contacta con el administrador', 'info').then(r => {
      this.router.navigate(['/landing']);
      return false;
    });
  }
}
