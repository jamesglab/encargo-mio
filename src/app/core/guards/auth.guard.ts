import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MENU } from 'src/app/layouts/sidebar/menu';
import Swal from 'sweetalert2';
import { StorageService } from '../../_services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: StorageService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const currentUser = this.authenticationService.getItem('currentUser');

        if (currentUser) {
            return true;
        }
        
        this.router.navigate(['/account/login']);
        this.authenticationService.clear();
        return false;
        // not logged in so redirect to login page with the return url

    }
}
