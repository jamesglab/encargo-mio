import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient) { }

  getUsersAdmin() {
    return this.http.get<any>(`${environment.microservices.management}users/`).pipe(
      map((res: any) => {
        return res;
      }), catchError(handleError));
  }

  getUserById(id) {
    return this.http.get<any>(`${environment.microservices.management}users/detail`, { params: { id } }).pipe(
      map((res: any) => {
        return res;
      }), catchError(handleError));
  }

  getUsersAdminPaginate(params): Observable<any> {
    return this.http.get<any>(`${environment.microservices.management}users/paginate`, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  createUser(user_type: number, user): Observable<any> {
    return this.http.post<any>(`${environment.microservices.management}users/insert_user`,
      user, { headers: header, params: { user_type: (user_type == 1) ? 'client' : 'company' } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${environment.microservices.management}users/`,
      { ...user }, { headers: header, params: { id: user.id } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getAddressByUser(params) {
    return this.http.get<any>(`${environment.microservices.management}users/addressess`,
      { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  deleteProductOnLocker(product: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.microservices.management}locker/delete-product`,
      { headers: header, params: { product } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

}
