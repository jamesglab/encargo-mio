
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { StorageService } from '../../../_services/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FragmentService {

  constructor(
    private http: HttpClient,
  ) { }

  getConvenyor() {
    return this.http.get<any>(
      `${environment.microservices.management}conveyor`, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getAddressByUser(params) {
    return this.http.get<any>(`${environment.microservices.user}address`,
      { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getShippingById(params) {
    return this.http.get<any>(
      `${environment.microservices.management}shipping-order/detail`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  // getImage(url: string): Observable<Blob> {
  //   return this.http.get(url, { responseType: 'blob' });
  // }

  getImage(image: { Location: string, Key: string }): Observable<Blob> {
    return this.http.get<any>(
      `${environment.microservices.management}shipping-order/get-image`,
      { headers: header, params: image }).pipe(
        map((res: any) => {
          const byteArray = new Uint8Array(res.body.data);
          return new Blob([byteArray], { type: res.type });
        }),
        catchError(handleError)
      );
  }

  setImageProductFragment(payload) {
    return this.http.post<any>(
      `${environment.microservices.management}shipping-order/product-fragment-image`, 
      payload).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  insert(payload) {
    return this.http.post<any>(
      `${environment.microservices.management}shipping-order/fragment`, payload, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

}
