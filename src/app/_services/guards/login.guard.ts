import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../auth/_services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private _authService: AuthService, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    this._authService.setUser();
    const currentUser = this._authService.currentUser;
    if (!currentUser) {
      // doesn´t exists user in so return true
      return true;
    }

    // logged in so redirect to landing page with the return url
    this.router.navigate(['/profile/subscriptions'])
    return false;
  }
  
}
