import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleError, header } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DragdropService {

  constructor(private http: HttpClient) { }

  moveAddProduct(payload: any): Observable<any> {
    return this.http.put<any>(
      `${environment.microservices.management}shipping-order/add-product`, payload, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  removeAddProduct(payload: any): Observable<any> {
    return this.http.put<any>(
      `${environment.microservices.management}shipping-order/remove-product`, payload, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

}
