import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FragmentService } from './services/fragment.service';

@Component({
  selector: 'app-fragment',
  templateUrl: './fragment.component.html',
  styleUrls: ['./fragment.component.scss']
})
export class FragmentComponent implements OnInit {
  public shipping: any;
  public conveyors: any;
  public addresses: any;
  public products_quantity: any;

  constructor(private _fragmentService: FragmentService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.getConveyors();
    this.getShippingById();
  }


  getShippingById() {

    this._fragmentService.getShippingById({ id: this.router.snapshot.params.id }).subscribe(res => {

      let products = res.products.length;
      this.products_quantity = products;
      this.shipping = res;

      // CONSUMIMOS EL ENDPOINT PARA LAS DIRECCIONES DEL USUARIO
      this.getAdrresesByUSer(res.user.id);

    })
  }

  getConveyors() {
    this._fragmentService.getConvenyor().subscribe(res => {
      this.conveyors = res;
    })
  }

  getAdrresesByUSer(id) {
    this._fragmentService.getAddressByUser({ id }).subscribe((res: any) => {
      this.addresses = res;
    })
  }

}
