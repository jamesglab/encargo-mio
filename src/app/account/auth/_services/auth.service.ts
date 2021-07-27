import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { StorageService } from '../../../_services/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: any = null;

  constructor(private http: HttpClient,
    // private landingService: LandingService,
    private router: Router,
    private _storageService: StorageService) {
    this.setUser();
  }

  //USER MODEL
  get currentUser(): any {
    return this.user;
  }

  setUser() {
    this.user = this.getAuthFromLocalStorage();
  }

  login(credentials: { email: string, password: string }): Observable<any> {

    this._storageService.clear();
    credentials.email = credentials.email.trim();

    return this.http.post<any>(`${environment.url_api}user/auth`, credentials, { headers: header }).pipe(
      map((res: any) => {
        // localStorage.setItem("currentUser", JSON.stringify({ user: res.user, token: res.token }));


        this._storageService.setItem("currentUser", { user: res.user, token: res.token });
        localStorage.setItem("lang", res.user.language || "es");
        this.user = this.getAuthFromLocalStorage();
        return res;
      }),
      catchError(handleError)
    );
  }

  private getAuthFromLocalStorage() {
    try {
      return this._storageService.getItem("currentUser");
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  recoverPassword(email: string): Observable<any> {
    email = email.trim().toLowerCase();
    return this.http.post<any>(
      `https://9386296438b6.ngrok.io/api/v1/user/auth/send-recovery`, { email: email }, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  resetPassword(url: string, password: any): Observable<any> {
    return this.http.post<any>(`https://9386296438b6.ngrok.io/api/v1/user/auth/reset-password`,
      { encript: url, password: password }, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      )
  }

  async logout() {
    await this._storageService.removeItem("currentUser")
    await this._storageService.clear();
    this.router.navigate(['/auth'], {
      queryParams: {},
    });
  }

}
