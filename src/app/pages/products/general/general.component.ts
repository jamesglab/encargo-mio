import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GET_STATUS } from "src/app/_helpers/tools/utils.tool";
import { UserService } from "src/app/_services/users.service";
import Swal from "sweetalert2";
import { OrderService } from "../../ecommerce/_services/orders.service";
import { ProductsService } from "../_services/products.service";
import { ModalOrderComponent } from "./modal-components/modal-order/modal-order.component";
import { ModalPurchaseComponent } from "./modal-components/modal-purchase/modal-purchase.component";
import { ModalShippingComponent } from "./modal-components/modal-update-shipping/modal-shipping.component";

@Component({
  selector: "app-general",
  templateUrl: "./general.component.html",
  styleUrls: ["./general.component.scss"],
})
export class GeneralComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // INPUTS CONTROLLER
  public filterCode = new FormControl();
  public filterOrderService = new FormControl();
  public filterOrderServiceStatus = new FormControl();
  public filterLockerDate = new FormControl();
  public filterIdProduct = new FormControl();
  public productName = new FormControl();
  public filterStatusProduct = new FormControl();
  public filterStore = new FormControl();
  public purchaseNumber = new FormControl();
  public filterUser = new FormControl();
  public filterDate = new FormControl();

  //ARRAYS
  public products = [];
  public stores = [];
  public users = [];
  public filteredUsers: Observable<any>;

  // integers
  public count = 0;
  constructor(
    private _productService: ProductsService,
    private _userService: UserService,
    private _orderService: OrderService,
    private _modal: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.filterProducts();
    this.getUsersAdmin();
    this.filteredUsers = this.filterUser.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value, "users"))
    );
  }

  getUsersAdmin(): void {
    this._userService.getUsersAdmin().subscribe(
      (users: any) => {
        this.users = users;
      },
      (err) => {
        throw err;
      }
    );
  }

  filterProducts(paginator?: any) {
    try {
      if (!paginator) {
        this.paginator.pageIndex = 0;
      }
      this._productService
        .getAllGenralProductInformation({
          pageSize: paginator?.pageSize || 10,
          page: paginator?.pageIndex + 1 || 1,
          ...this.filterValues(),
        })
        .subscribe((res: any) => {
          this.count = parseInt(res.count);
          this.products = res.products;
          this.validationOptions();
        }, err => {
          throw err;
        });
    } catch (error) {
      console.error(error);
    }
  }

  validationOptions(): void {
    if (this.products && this.products.length > 0) {
      this.products.map((product: any) => {
        if (this.purchaseNumber.value && !this.filterOrderService.value) {
          product.option = true;
        } else if (this.filterCode.value && !this.filterOrderService.value) {
          product.option = true;
        } else if (product.order_service) {
          product.option = true;
        } else {
          product.option = false;
        }
      });
    }
  }

  formatDate() {
    if (this.filterDate.value?.year) {
      return moment(
        new Date(
          this.filterDate.value.year,
          this.filterDate.value.month - 1,
          this.filterDate.value.day
        )
      ).format("YYYY/MM/DD");
    } else {
      return "";
    }
  }

  formatLockerDate() {
    if (this.filterDate.value?.year) {
      return moment(
        new Date(
          this.filterDate.value.year,
          this.filterDate.value.month - 1,
          this.filterDate.value.day
        )
      ).format("YYYY/MM/DD");
    } else {
      return "";
    }
  }

  filterValues() {
    const filtereds: any = {};

    if (this.filterIdProduct.value) {
      filtereds["product_id"] = this.filterIdProduct.value;
    }

    if (this.productName.value) {
      filtereds["product_name"] = this.productName.value;
    }

    if (this.filterStatusProduct.value && this.filterStatusProduct.value != 'null') {
      filtereds["product_status"] = this.filterStatusProduct.value;
    }
    if (this.filterOrderService.value) {
      filtereds["order_service"] = this.filterOrderService.value;
    }

    if (this.filterCode.value) {
      filtereds["order_purchase"] = this.filterCode.value;
    }

    if (this.filterDate.value) {
      filtereds["locker_created_at"] = new Date(
        this.filterDate.value.year,
        this.filterDate.value.month - 1,
        this.filterDate.value.day
      );
    }
    if (this.purchaseNumber.value) {
      filtereds["shipping_order"] = this.purchaseNumber.value;
    }

    if (this.filterUser.value?.id) {
      filtereds["user"] = this.filterUser.value.id;
    }
    return filtereds;
  }

  onImageError(event) {
    event.target.src = "https://i.imgur.com/riKFnErh.jpg";
  }

  displayModalProduct(product: any) {
    if (this.purchaseNumber.value && !this.filterOrderService.value) {
      this._orderService
        .getShippingById({ id: product.shipping_order })
        .subscribe((res) => {
          const modal = this._modal.open(ModalShippingComponent, {
            size: "xl",
            centered: true
          });
          modal.componentInstance.shippingToUpdate = res;
          modal.componentInstance.user = this.users;
        });
    } else if (this.filterCode.value && !this.filterOrderService.value) {
      this._orderService
        .getPurchaseByOrderId({ id: product.order_purchase })
        .subscribe((res) => {
          const modal = this._modal.open(ModalPurchaseComponent, {
            size: "xl",
            centered: true
          });
          modal.componentInstance.purchaseSelected = res;
        });
    } else if (product.order_service) {
      this._orderService
        .detailOrder({ id: product.order_service })
        .subscribe((res) => {
          const modal = this._modal.open(ModalOrderComponent, {
            size: "xl",
            centered: true
          });
          modal.componentInstance.orderSelected = res;
        });
    }
  }

  displayFnUserName(name: any) {
    return name
      ? `CA${name.locker_id} | ${name.name + " " + name.last_name}`
      : "";
  }

  _filter(value: string, array: any): string[] {
    const filterValue = this._normalizeValue(value, array);
    let fileterdData = this[array].filter((option) =>
      this._normalizeValue(option, array).includes(filterValue)
    );
    if (fileterdData.length > 0) {
      return fileterdData;
    } else {
      return this[array];
    }
  }

  private _normalizeValue(value: any, array: any): string {
    if (typeof value === "object") {
      if (array === "conveyors") {
        return value?.name.toLowerCase().replace(/\s/g, "");
      } else if (array === "users") {
        return value?.full_name.toLowerCase().replace(/\s/g, "");
      } else if (array === "address") {
        return value?.address.toLowerCase().replace(/\s/g, "");
      }
    } else {
      return value.toLowerCase().replace(/\s/g, "");
    }
  }

  getProductStatus(product: { [key: string]: any }): string {
    if (product.locker_has_product) {
      let statuses = {
        "0": "EN BODEGA",
        "1": "EN CONSOLIDACIÓN",
        "2": "ENVIADO",
        "3": "ENTREGADO"
      };
      return statuses[product.locker_has_product_status.toString()];
    } else {
      if (product.order_service) {
        return "EN COTIZACIÓN";
      }
    }
  }

}
