import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { Observable } from "rxjs";
import { header, handleError } from "src/app/_helpers/tools/header.tool";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  constructor(private http: HttpClient) { }

  getProductInfo(url: string): Observable<any> {
    return this.http
      .post<any>(`${environment.microservices.scraping}`, { url })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getQuotations(params) {
    return this.http
      .get<any>(`${environment.microservices.management}orders`, {
        headers: header,
        params,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  detailOrder(params: any): Observable<any> {
    return this.http
      .get<any>(`${environment.microservices.management}orders/detail`, {
        headers: header, params
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  createQuotation(body: any) {
    if (body && body.length > 0) {
      body.map((item: any) => {
        delete item.uploaded_files;
      });
    }
    return this.http
      .post<any>(`${environment.microservices.management}orders`, body)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateOrder(order) {
    const products = order.products;
    return this.http
      .put<any>(
        `${environment.microservices.management}orders`,
        { ...order, status: "1" },
        { headers: header, params: { id: order.id } }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getTRM() {
    return this.http
      .get<any>(`${environment.microservices.management}trm`, {
        headers: header,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  calculateShipping(products: any) {
    return this.http
      .post<any>(
        `${environment.microservices.management}orders/calculate-shipping`,
        { products: products, type: "quotation" }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  // HACEMOS CONSULTA PARA TENER LAS TIENDAS ASOCIADAS A ENCARGOMIO
  getStores() {
    return this.http
      .get<any>(`${environment.microservices.management}store`, {
        headers: header,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  registerPurchase(purchase: any) {
    return this.http
      .post<any>(
        `${environment.microservices.management}order-purchase`,
        purchase
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getLockerByUser(params) {
    return this.http
      .get<any>(`${environment.microservices.management}locker/user`, {
        headers: header,
        params,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getPurchaseByOrder(params) {
    return this.http
      .get<any>(
        `${environment.microservices.management}order-purchase/filter`,
        { headers: header, params }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getPurchaseByOrderId(params) {
    return this.http
      .get<any>(`${environment.microservices.management}order-purchase/detail`, {
        headers: header,
        params,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getConvenyor() {
    return this.http
      .get<any>(`${environment.microservices.management}conveyor`, {
        headers: header,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  insertProductLocker(payload: any) {
    return this.http
      .post<any>(`${environment.microservices.management}locker`, payload)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateProductLocker(payload: any) {
    return this.http
      .put<any>(`${environment.microservices.management}locker`, payload)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getProductsByLocker(params) {
    return this.http
      .get<any>(`${environment.microservices.management}locker/products`, {
        headers: header,
        params,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getProductsByockerAndStatus(params: any): Observable<any> {
    return this.http
      .get<any>(`${environment.microservices.management}locker/products`, {
        headers: header,
        params,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getShippingTypes() {
    return this.http
      .get<any>(`${environment.microservices.management}shipping-types`, {
        headers: header,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  createShipping(payload) {
    return this.http
      .post<any>(
        `${environment.microservices.management}shipping-order`,
        payload,
        { headers: header }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getAllShippings(params: any) {
    return this.http
      .get<any>(`${environment.microservices.management}shipping-order`, {
        headers: header,
        params,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getShippingById(params) {
    return this.http
      .get<any>(
        `${environment.microservices.management}shipping-order/detail`,
        { headers: header, params }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  addProductByShipping(payload, params) {
    return this.http
      .post<any>(
        `${environment.microservices.management}shipping-order/add-product`,
        payload,
        { headers: header, params }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  deleteProductByShipping(payload, params) {
    return this.http
      .put<any>(
        `${environment.microservices.management}shipping-order/delete-product`,
        payload,
        { headers: header, params }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateShipping(payload: any) {
    return this.http
      .put<any>(
        `${environment.microservices.management}shipping-order/`,
        payload,
        { headers: header }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateImageByProduct(payload) {
    return this.http
      .post<any>(
        `${environment.microservices.management}orders/update-image`,
        payload
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  uploadNewImage(payload: any) {
    return this.http
      .post<any>(
        `${environment.microservices.management}orders/add-image`,
        payload
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getOrderPurchase(params) {
    return this.http
      .get<any>(`${environment.microservices.management}order-purchase`, {
        headers: header,
        params,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updatePurchase(payload) {
    return this.http
      .put<any>(
        `${environment.microservices.management}order-purchase`,
        payload
      )
      .pipe(
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
    );
  }

  getOrderService(id: string): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}income/by-order-service`,
      { headers: header, params: { id } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getOrderServiceWithoutOrder(id: string): Observable<any> {
    return this.http.get<any>(
      `${environment.microservices.management}income`,
      { headers: header, params: { id } }
    ).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }

  getDataByGuide(data: any): Observable<any> {
    return this.http
      .get<any>(`${environment.microservices.management}locker/guide-number`, {
        headers: header,
        params: { guide_number: data },
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getUsersByName(data: any): Observable<any> {
    return this.http
      .get<any>(`${environment.microservices.management}users/by-name`, {
        headers: header,
        params: { name: data },
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  getLockersByUser(data: any): Observable<any> {
    return this.http
      .get<any>(`${environment.microservices.management}locker/user-locker`, {
        headers: header,
        params: { user: data }
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  updateShippingPacked(payload: any) {
    delete payload.products;
    return this.http
      .put<any>(
        `${environment.microservices.management}shipping-order`,
        payload
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  validateNotProducts(shipping_order: any) {
    return this.http
      .get<any>(
        `${environment.microservices.management}shipping-order/validate-not-products`,
        { headers: header, params: { shipping_order: shipping_order } }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  deleteProduct(product: string): Observable<any> {
    return this.http
      .delete<any>(
        `${environment.microservices.management}orders/delete-product`,
        { headers: header, params: { product } }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  countsTabs() {
    return this.http
      .get<any>(`${environment.microservices.management}orders/count-tabs`, {
        headers: header,
      })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  countsTabsShipping() {
    return this.http
      .get<any>(
        `${environment.microservices.management}shipping-order/count-tabs`,
        { headers: header }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  shippingOrderIsDelivered(id) {
    return this.http
      .put<any>(
        `${environment.microservices.management}shipping-order/is-delivered`,
        {},
        { params: { id } }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  //UPDATE CONVEYOR STATUS LAMBDA
  updateStatusConveyor(shipping_order): Observable<any> {
    return this.http
      .post<any>(`${environment.microservices.updateConveyor}`, shipping_order)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

  anulateOrder(id: any): Observable<any> {
    return this.http
      .put<any>(
        `${environment.microservices.management}orders/anulate-order`,
        {},
        { headers: header, params: { id } }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }


  cancelOrderWithReason(id: any, cancel_reason: string): Observable<any> {
    return this.http
      .put<any>(
        `${environment.microservices.management}orders/cancel-order`,
        {}, { headers: header, params: { id, cancel_reason } }
      )
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(handleError)
      );
  }

}
