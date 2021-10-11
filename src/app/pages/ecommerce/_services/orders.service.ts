
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  constructor(
    private http: HttpClient,
  ) { }

  getProductInfo(url: string): Observable<any> {
    return this.http.post<any>(
      `${environment.microservices.scraping}`, { url }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getQuotations(params) {
    return this.http.get<any>(
      `${environment.microservices.management}orders`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  detailOrder(params) {
    return this.http.get<any>(
      `${environment.microservices.management}orders/detail`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  createQuotation(body) {
    return this.http.post<any>(
      `${environment.microservices.management}orders`, body,
      { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError));

  }

  updateOrder(order) {
    const products = order.products;
    return this.http.put<any>(
      `${environment.microservices.management}orders`, { ...order, status: '1' },
      { headers: header, params: { id: order.id } }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError));
  }

  getTRM() {
    return this.http.get<any>(
      `${environment.microservices.management}trm`, { headers: header, }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  calculateShipping(products: any) {
    return this.http.post<any>(
      `${environment.microservices.management}orders/calculate-shipping`, { products: products, type: 'quotation' }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  // HACEMOS CONSULTA PARA TENER LAS TIENDAS ASOCIADAS A ENCARGOMIO
  getStores() {
    return this.http.get<any>(
      `${environment.microservices.management}store`, { headers: header, }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  registerPurchase(purchase: any) {
    return this.http.post<any>(
      `${environment.microservices.management}order-purchase`, purchase
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  getLockerByUser(params) {

    return this.http.get<any>(
      `${environment.microservices.management}locker/user`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getPurchaseByOrder(params) {
    return this.http.get<any>(
      `${environment.microservices.management}order-purchase/filter`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getConvenyor() {
    return this.http.get<any>(
      `${environment.microservices.management}conveyor`, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  insertProductLocker(payload: any) {
    return this.http.post<any>(
      `${environment.microservices.management}locker`, payload
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  updateProductLocker(payload: any) {
    return this.http.put<any>(
      `${environment.microservices.management}locker`, payload
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  getProductsByLocker(params) {
    return this.http.get<any>(
      `${environment.microservices.management}locker/products`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getShippingTypes() {
    return this.http.get<any>(
      `${environment.microservices.management}shipping-types`, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  createShipping(payload) {
    return this.http.post<any>(
      `${environment.microservices.management}shipping-order`, payload, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getAllShippings(params) {
    return this.http.get<any>(
      `${environment.microservices.management}shipping-order`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getShippingById(params) {
    return this.http.get<any>(
      `${environment.microservices.management}shipping-order/detail`, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  addProductByShipping(payload, params) {
    return this.http.post<any>(
      `${environment.microservices.management}shipping-order/add-product`, payload, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  deleteProductByShipping(payload, params) {
    return this.http.put<any>(
      `${environment.microservices.management}shipping-order/delete-product`, payload, { headers: header, params }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateShipping(payload: any) {
    if (payload.status === 3) {
      delete payload.deleted_products;
      delete payload.products;
    }
    return this.http.put<any>(
      `${environment.microservices.management}shipping-order/`, payload, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateImageByProduct(payload) {
    return this.http.post<any>(
      `${environment.microservices.management}orders/update-image`, payload).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getOrderPurchase() {
    return this.http.get<any>(
      `${environment.microservices.management}order-purchase`, { headers: header }).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updatePurchase(payload) {
    return this.http.put<any>(
      `${environment.microservices.management}order-purchase`, payload).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  ordersForPurchase(params: any): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}order-purchase/products`,
      { headers: header, params }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  getDataByGuide(data: any): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}locker/guide-number`,
      { headers: header, params: { guide_number: data } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  getUsersByName(data: any): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}users/by-name`,
      { headers: header, params: { name: data } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  getLockersByUser(data: any): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}locker/user-locker`,
      { headers: header, params: { user: data } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

  updateShippingPacked(payload: any) {
    delete payload.products
    return this.http.put<any>(
      `${environment.microservices.management}shipping-order`, payload).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  validateNotProducts(shipping_order: any) {
    console.log(shipping_order)
    return this.http.get<any>(
      `${environment.microservices.management}shipping-order/validate-not-products`,
      { headers: header, params: { shipping_order: shipping_order } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    )
  }

}
