
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { StorageService } from '../../_services/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient,
    private router: Router,
    private _storageService: StorageService) {
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}role`, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getPermissions(): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}permission`, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getPermissionById(id) {
    return this.http.get<any>(
      `${environment.microservices.management}permission`, { headers: header, params: { id } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getRoleById(id) {

    return this.http.get<any>(
      `${environment.microservices.management}role/detail`, { headers: header, params: { id } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );

  }
  createRol(role) {
    return this.http.post<any>(
      `${environment.microservices.management}role`, role, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  roleDetail() {
    // localhost:4001/api/v1/user/role/detail?id=1
  }
  updateRol(role) {
    return this.http.put<any>(
      `${environment.microservices.management}role`, role, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  addPermisionRole(role_permission) {
    return this.http.put<any>(
      `${environment.microservices.management}role/add-permission`, role_permission, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  deletePermission(role_permission) {
    return this.http.put<any>(
      `${environment.microservices.management}role/delete-permission`, role_permission, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  createPermission(permission) {
    return this.http.post<any>(
      `${environment.microservices.management}permission`, permission, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }
}
