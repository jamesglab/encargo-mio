import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductsService} from '../_services/products.service';
import { GET_STATUS, validateShippingstatus } from 'src/app/_helpers/tools/utils.tool';

@Component({
  selector: 'app-search-product',
  templateUrl: './search-product.component.html',
  styleUrls: ['./search-product.component.scss']
})
export class SearchProductComponent implements OnInit {
  
  public product_id: string = null;
  public product_info: { [ key: string ]: any } = null;
  private unsuscribe: Subscription[] = [];

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
  }

  onSearch($event: any){
    const infoSubscr = this.productsService.getProductInformation($event.target.value)
    .subscribe((res) => { 
      const { product_info } = res;
      this.product_info = product_info;
    }, (err) => { throw err; });
    this.unsuscribe.push(infoSubscr);
  }

  onImageError(event) { event.target.src = "https://i.imgur.com/riKFnErh.jpg"; }

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
