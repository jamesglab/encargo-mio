
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderShippingService {

  constructor(private httpClient: HttpClient) { }

  getTotallyShippings(): Observable<{ shipping_orders: any[] }> {
    return this.httpClient.get<any>(
      `${environment.microservices.management}shipping-order/totally`, 
      { headers: header })
      .pipe(map((res: any) => { return res; }), catchError(handleError));
  }

  getFractionedChildren(parent_id: number): Observable<{ fractioned_shippings: any[] }> {
    return this.httpClient.get<any>(
      `${environment.microservices.management}shipping-order/fractioned-children`, 
      { headers: header, params: { parent_id } })
      .pipe(map((res: any) => { return res; }), catchError(handleError));
  }

  updateShippingStatus(payload: any): Observable<{ message: string }> {
    return this.httpClient.put<any>(
      `${environment.microservices.management}shipping-order/update-status`, payload, { headers: header })
      .pipe(map((res: any) => { return res; }), catchError(handleError));
  }

}
