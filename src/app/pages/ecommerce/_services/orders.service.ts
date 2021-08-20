
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
export class OrderService {

  constructor(private http: HttpClient,
    private router: Router,
    private _storageService: StorageService) {
  }

  getProductInfo(url: string): Observable<any> {
    return this.http.post<any>(
      `${environment.microservices.orders}product-url`, { url }, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getQuotations(params) {
    if (!params.status) delete params.status;
    return this.http.get<any>(
      `${environment.microservices.management}orders`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }


  detailOrder(params) {
    return this.http.get<any>(
      `${environment.microservices.management}orders/detail`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }
  createQuotation(body) {
    return this.http.post<any>(
      `${environment.microservices.management}orders`,body,
      { headers: header}).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError));

  }
  updateOrder(order) {
    const products = order.products;
    return this.http.put<any>(
      `${environment.microservices.management}orders`, { ...order, status: '1' },
      { headers: header, params: { id: order.id } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError));
  }

  getTRM() {
    return this.http.get<any>(
      `${environment.microservices.management}trm`, { headers: header, }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }
}
