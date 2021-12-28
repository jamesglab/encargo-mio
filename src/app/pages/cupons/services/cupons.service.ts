import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CuponsService {

  constructor(
    private http: HttpClient,
  ) { }

  getCupons() {
    return this.http.get<any>(
      `${environment.microservices.management}cupons`, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        // catchError(handleError)
      );
  }


  // createCupons(payload) {
  //   return this.http.post<any>(
  //     `${environment.microservices.management}cupons`, payload).pipe(
  //       map((res: any) => {
  //         return res;
  //       }),
  //       catchError(handleError)
  //     );
  // }
  createCupons(payload) {
    return this.http.post<any>(
      `${environment.microservices.management}cupons/create`, payload
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  updateCupons(payload) {
    return this.http.put<any>(
      `${environment.microservices.management}cupons/update`, payload).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }
}
