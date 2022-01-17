import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleError, header } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PurchaseService {

  constructor(
    public http: HttpClient
  ) { }

  getTransactionByOrder(order_service: string): Observable<any> {
    return this.http
      .get<any>(`${environment.microservices.management}transactions/by-order`, {
        headers: header, params: { order_service }
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

}
