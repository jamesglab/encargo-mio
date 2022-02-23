import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductsService } from '../_services/products.service';
import { GET_STATUS, validateShippingstatus } from 'src/app/_helpers/tools/utils.tool';

@Component({
  selector: 'app-search-product',
  templateUrl: './search-product.component.html',
  styleUrls: ['./search-product.component.scss']
})

export class SearchProductComponent implements OnInit {

  public product_id: string = null;
  public product_info: { [key: string]: any } = null;
  private unsuscribe: Subscription[] = [];

  public isLoading: boolean = false;
  public isIphone: boolean = false;

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.checkOperativeSystem();
  }

  checkOperativeSystem() {
    if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
      if (document.cookie.indexOf("iphone_redirect=false") == -1) {
        this.isIphone = true;
      } else {
        this.isIphone = false;
      }
    }
  }

  onSearch($event: any) {
    this.isLoading = true;
    const infoSubscr = this.productsService.getProductInformation($event.target.value)
      .subscribe((res: any) => {
        const { product_info } = res;
        this.product_info = product_info;
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
        throw err;
      });
    this.unsuscribe.push(infoSubscr);
  }

  keyDownFunction(event: any, value?: any) {
    console.log(value);
    if (this.isIphone) {
      if (event.keyCode === 13) { // Si presiona el botón de intro o return en safari en IOS.
        // this.onSearch();
      }
    } else {
      return;
    }
  }

  onImageError(event: any) { event.target.src = "https://i.imgur.com/riKFnErh.jpg"; }

  quotationStatus(status: string): string {
    return GET_STATUS(status)
  }

  shippingStatus(status: string): string {
    return validateShippingstatus(status);
  }

  ngOnDestroy() {
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }

}
