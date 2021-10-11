
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private http: HttpClient
  ) { }

  getTransactionsFilter(params): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}transactions`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateTransaction(transaction: any, status): Observable<any> {
    return this.http.put<any>(
      `${environment.microservices.management}transactions`,
      { status, order_service: transaction.order_service },
      { headers: header, params: { id: transaction.id, } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getTransactionsFilterI(params){
    return this.http.get<any>(
      `${environment.microservices.management}transactions/filter-for-page`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      ); 
  }
}
