import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { header, handleError } from 'src/app/_helpers/tools/header.tool';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }

  getProductInformation(id: string): Observable<any> {
    return this.http
      .get<any>(`${environment.microservices.management}products/detail`, { params: { id } })
      .pipe(map((res: any) => {return res; }), catchError(handleError));
  }

}
