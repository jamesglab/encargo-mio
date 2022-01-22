import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/_services/users.service';
import { OrderService } from '../_services/orders.service';
import { SHIPPING_STATUS } from 'src/app/_helpers/tools/utils.tool';
import { ExportExcelService } from '../_services/export-excel.service';
import { OrderShippingService } from './_services/order-shipping.service';

@Component({
  selector: 'app-orders-shippings',
  templateUrl: './orders-shippings.component.html',
  styleUrls: ['./orders-shippings.component.scss']
})

export class OrdersShippingsComponent implements OnInit {

  public term: any;
  public shippings: any;
  public shippingToUpdate: any;
  public shippingTracking: any;
  public shipping_status: { [key: string]: any } = null;//ITS A SHIPPING OBJECT { ... }
  public SHIPPING_STATUS: { [key: string]: any }[] = SHIPPING_STATUS;
  private unsuscribe: Subscription[] = [];
  public trm: any;

  public itemPerPage: number = 5;
  public status: number = 0;
  public count: number = 0;
  public page: number = 1;

  public isLoading: boolean = false;
  public exportLoading: boolean = false;
  public resetAllFilters: boolean = false;

  public filteredData: any = {};
  public counts: any = {};

  public users: any = [];

  constructor(
    private readonly _orderService: OrderService,
    private _userService: UserService,
    private modalService: NgbModal,
    private exportExcelService: ExportExcelService,
    private shippingOrderService: OrderShippingService,
    public _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getTransactions();
    this.getUsersAdmin();
    this.getTRM();
    this.getCountsTabs();
  }

  getCountsTabs() {
    this._orderService.countsTabsShipping()
      .subscribe((res: any) => {
        this.counts = res;
      }, err => {
        throw err;
      });
  }

  getUsersAdmin() {
    this._userService.getUsersAdmin()
      .subscribe((users: any) => {
        this.users = users;
      }, err => {
        throw err;
      });
  }

  getTRM() {
    this._orderService.getTRM()
      .subscribe((res: any) => {
        this.trm = res;
      }, err => {
        throw err;
      });
  }

  getTransactions(pagination?: any) {
    this.isLoading = true;
    this._orderService.getAllShippings({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
      status: this.status ? this.status : '0',
      ...this.filteredData
    }).subscribe((res: any) => {
      this.shippings = res.shipping_orders;
      this.count = res.count;
      this.isLoading = false;
      this._cdr.detectChanges();
    }, err => {
      this.isLoading = false;
      throw err;
    });
  }

  shippingFilterReceive(event: any) {
    if (event.reset) {
      this.filteredData = {};
    } else {
      this.filteredData = event.data;
    }
    this.getTransactions();
  }

  export() {
    //JUST DO IT
    this.exportLoading = true;
    const totallySubscr = this.shippingOrderService.getTotallyShippings()
    .subscribe((res) => {
      this.exportLoading = false;
      this.exportExcelService.exportConsolidateWithStyles({ ENVIOS: res.shipping_orders }, "Envios Encargomio")
    }, err => { this.exportLoading = false; throw err; });
    this.unsuscribe.push(totallySubscr);
    // this.exportExcelService.exportConsolidateWithStyles({ ENVIOS: [{ No: "1", id: "LKA4", guia: "ABC4556" }, { No: "2", id: "KIOA6", guia: "ABC4556" }] },"Archivo cualquiera");
  }

  resetFilters() {
    this.resetAllFilters = true;
    this._cdr.detectChanges();
  }

  defaultResetValuesReceive(event: boolean) {
    this.resetAllFilters = event;
  }

  /**@param $event equals to one shipping_order*/
  showChangeStatusModal($event: { [key: string]: any }, template: any): void {
    this.shipping_status = $event;
    this.modalService.open(template, { size: 'sm', centered: true });
  }

  openModal(modal: any, sizeModale: string) {
    this.modalService.open(modal, { size: sizeModale, centered: true });
  }

  updateShipping() { }

  ngOnDestroy() {
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }

}
