
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  constructor(private httpClient: HttpClient) { }

  deletePurchase(payload: { id: number }): Observable<{ message: string }> {
    return this.httpClient.put<any>(
      `${environment.microservices.management}order-purchase/delete`, payload, { headers: header })
      .pipe(map((res: any) => { return res; }), catchError(handleError));
  }
  
}
