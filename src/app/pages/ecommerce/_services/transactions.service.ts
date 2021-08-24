
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
export class TransactionService {

  constructor(private http: HttpClient,
    private router: Router,
    private _storageService: StorageService) {
  }


  getTransactionsFilter(params) {
    return this.http.get<any>(
      `${environment.microservices.management}transactions`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateTransaction(id, status) {

    return this.http.put<any>(
      `${environment.microservices.management}transactions`, { status }, { headers: header, params: { id } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }
}
