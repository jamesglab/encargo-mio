
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
      `${environment.url_api.orders}orders/product-url`, { url }, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  createQuotation(quotation) {

    return this.http.post<any>(
      `${environment.url_api.orders}orders/admin`, quotation, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }
  // makeQuotation(data: { products: any[] }): Observable<any> {
  //   return this.http.post<any>(
  //     `https://c78cfa85ab8a.ngrok.io/api/v1/orders`, data, { headers: header }).pipe(
  //       map((res: any) => {
  //         return res;
  //       }),
  //       catchError(handleError)
  //     );
  // }
  getQuotations(params) {
    if (!params.status) delete params.status;
    return this.http.get<any>(
      `${environment.url_api.orders}orders/admin`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }


  detailOrder(params) {
    return this.http.get<any>(
      `${environment.url_api.orders}orders/detail`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateOrder(order) {
    const products = order.products;
    return this.http.put<any>(
      `${environment.url_api.orders}/admin/update`, order, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getTRM() {
    return this.http.get<any>(
      `${environment.url_api.orders}orders/trm`, { headers: header, }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }
}
