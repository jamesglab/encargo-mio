import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleError, header } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class LockersService {

  constructor(
    private http: HttpClient
  ) { }

  getAllLockers(params: any): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}locker/all-products`, { headers: header, params }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getDataByGuideNumber(guide: string): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}locker/products-guide-number`,
      { headers: header, params: { guide_number: guide } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getLockerDetail(id: string): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}locker/detail-product`,
      { headers: header, params: { product: id } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getProductsByIncome(id: string): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}income?id=${id}`,
      { headers: header }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getTypeOfShipping(data: string): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}locker/type-of-shipping`,
      { headers: header, params: { order_service: data } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getProductsInLocker(data: any): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}shipping-order/obtain-products`,
      { headers: header, params: { ...data } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  uploadImageNewLocker(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.microservices.management}products/upload-images`, payload
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  deleteImage(Key: string): Observable<any> {
    return this.http.post<any>(
      `${environment.microservices.management}products/delete-image`, { Key: Key }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  uploadImageInvoice(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.microservices.management}products/upload-invoice`, payload
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  insertIncome(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.microservices.management}income`, payload
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  updateLocker(payload: any): Observable<any> {
    return this.http.put<any>(
      `${environment.microservices.management}income`, payload
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getGuideIncome(guide: string): Observable<any> {
    let guide_number = guide.trim();
    return this.http.get<any>(
      `${environment.microservices.management}income/by-guide`,
      { headers: header, params: { guide_number } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  deleteIncome(id: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.microservices.management}income`,
      { headers: header, params: { id } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

}
