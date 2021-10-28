import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { LockersService } from "src/app/pages/lockers/_services/lockers.service";
import { updateShipping } from "src/app/_helpers/tools/create-order-parse.tool";
import { NotifyService } from "src/app/_services/notify.service";
import { UserService } from "src/app/_services/users.service";
import Swal from "sweetalert2";
import { ExportPdfService } from "../../../_services/export-pdf.service";
import { OrderService } from "../../../_services/orders.service";

@Component({
  selector: "app-modal-update-shipping",
  templateUrl: "./modal-update-shipping.component.html",
  styleUrls: ["./modal-update-shipping.component.scss"],
})

export class ModalUpdateShippingComponent implements OnInit {

  @Input() public users: any = [];
  @Input() public trm: any;
  @Input() public shippingToUpdate: any;
  @Input() public status: number;

  @Output() public getTransactions = new EventEmitter<any>();

  public isLoading: boolean = false;
  public isLoadingLabel: boolean = false;
  public isLoadingData: boolean = false;

  public conveyors: any = [];
  public address: any = [];
  public products: any = [];

  public inLocker: any = [];
  public outLocker: any = [];

  public shipping_types: [] = [];
  public deleted_products: any = [];
  public updateShippingForm: FormGroup;
  public addressSelected: any = {};

  public message: any = { status: false, await_products: false };

  public filteredConveyors: Observable<string[]>;
  public filteredAddress: Observable<string[]>;
  public filteredUsers: Observable<string[]>;

  constructor(
    private _userService: UserService,
    private _lockers: LockersService,
    private _orderService: OrderService,
    private _formBuilder: FormBuilder,
    private _notify: NotifyService,
    public modalService: NgbModal,
    public _label: ExportPdfService,
    public _router: Router
  ) { }

  ngOnInit(): void { }

  getConveyorsAndShippings() {

    this._orderService.getConvenyor().subscribe((res: any) => {
      this.conveyors = res;
    }, err => {
      throw err;
    });

    this._orderService.getShippingTypes().subscribe((res: any) => {
      this.shipping_types = res;
    }, err => {
      throw err;
    });

  }

  ngOnChanges() {
    if (this.shippingToUpdate) {
      this.isLoadingData = true;
      this.isLoadingLabel = true;
      this.getConveyorsAndShippings();
      setTimeout(() => {
        this.buildForm(this.shippingToUpdate);
      }, 1000);
    }
  }

  buildForm(shipping: any): void {

    this.addressSelected = shipping.address; // Ojo esta variable se usa para la generación del rótulo.
    shipping.address.first_name = shipping.address.name;
    delete shipping.address.name;

    this.updateShippingForm = this._formBuilder.group({
      id: [shipping.id],
      trm: [this.trm],
      guide_number: [shipping.guide_number, Validators.required],
      conveyor: [this.conveyors.find((item) => item.id == shipping.conveyor), [Validators.required]],
      delivery_date: [{ day: parseInt(moment(shipping.delivery_date).format("D")), month: parseInt(moment(shipping.delivery_date).format("M")), year: parseInt(moment(shipping.delivery_date).format("YYYY")), }, Validators.required,],
      total_value: [shipping.total_value, Validators.required],
      shipping_type: [shipping.shipping_type ? shipping.shipping_type.id : null, [Validators.required]],
      user: [shipping.user, Validators.required,],
      address: [shipping.address ? shipping.address : null, [Validators.required]],
      observations: [shipping.observations],
      products: [null, Validators.required]
    });

    console.log(this.updateShippingForm.getRawValue());

    this.filteredConveyors = this.updateShippingForm.controls.conveyor.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'conveyors')));
    this.filteredAddress = this.updateShippingForm.controls.address.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'address')));
    this.filteredUsers = this.updateShippingForm.controls.user.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));

    this.getInfoUser();
    this.disabledInputs();
  }

  get form() {
    return this.updateShippingForm.controls;
  }

  async getInfoUser() {

    await this._userService.getAddressByUser({ id: this.updateShippingForm.get("user").value.id })
      .subscribe((res: any) => {
        console.log('addresss',res)
        this.address = res;
        // this.address.map((item: any) => { // Recorrermos el arreglo de address 
        //   item.last_name = item.name; // Creamos una nueva posición llamada last_name y le asginamos la propiedad de name
        //   delete item.name; // Eliminamos el item.nombre para que en el filtro no hayan errores
        // });
      }, err => {
        throw err;
      });

    await this._lockers.getProductsInLocker({
      locker: this.updateShippingForm.controls.user.value.locker[0].id,
      shipping_id: this.updateShippingForm.controls.id.value
    }).subscribe((locker: any) => {
      this.inLocker = locker.in_locker;
      this.outLocker = locker.in_shipping;
      this.updateShippingForm.controls.products.setValue(this.outLocker);
    }, err => {
      throw err;
    });

    await this._orderService.validateNotProducts(this.shippingToUpdate.id)
      .subscribe((res: any) => {
        this.message = { ...res };
      }, err => {
        throw err;
      });

    this.isLoadingData = false;
    this.isLoadingLabel = false;
  }

  drop(event: CdkDragDrop<string[]>) {
    // console.log("EVENTO DEL DROP", event.previousContainer.data[event.previousIndex]);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  updateShippingPackcage() {
    this.isLoading = true;
    this._orderService.updateShippingPacked({
      status: '2',
      id: this.shippingToUpdate.id
    }).subscribe((res: any) => {
      this.modalService.dismissAll();
      this.getTransactions.emit(true);
      this._notify.show('Orden de envío actualizada correctamente.', '', 'success');
    }, err => {
      this.isLoading = false;
      this._notify.show('Error', 'No pudimos actualizar la orden, intenta de nuevo.', 'error');
      throw err;
    });
  }

  disabledInputs() {
    if (this.status === 3) {
      this.updateShippingForm.controls.delivery_date.disable();
      this.updateShippingForm.controls.total_value.disable();
      this.updateShippingForm.controls.shipping_type.disable();
      this.updateShippingForm.controls.user.disable();
      this.updateShippingForm.controls.address.disable();
      this.updateShippingForm.controls.observations.disable();
    }
  }

  _filter(value: string, array: any): string[] {
    const filterValue = this._normalizeValue(value, array);
    let fileterdData = this[array].filter(option => this._normalizeValue(option, array).includes(filterValue));
    if (fileterdData.length > 0) {
      return fileterdData;
    } else {
      return this[array];
    }
  }

  private _normalizeValue(value: any, array: any): string {
    if (typeof value === 'object') {
      if (array === 'conveyors') {
        return value.name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'users') {
        return value.full_name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'address') {
        return value.address.toLowerCase().replace(/\s/g, '');
      }
    } else {
      return value.toLowerCase().replace(/\s/g, '');
    }
  }

  displayFn(option: any) {
    return option ? option.name : '';
  }

  displayFnAddress(address: any) {
    return address ? address.address : '';
  }

  displayFnUserName(name: any) {
    if (name) {
      return name ? 'CA ' + name.locker[0].id + ' | ' + name.name : '';
    }
  }

  deleteProduct(array: any, index: number) {
    this.deleted_products.push(this[array][index]);
    this.inLocker.unshift(this[array][index]);
    this[array].splice(index, 1);
    this._notify.show('', 'Eliminaste el producto correctamente', 'info');
  }

  generateLabel() {
    this.isLoadingLabel = true;
    let UID: string = "";
    UID = this.updateShippingForm.getRawValue().id;
    if (this.updateShippingForm.getRawValue()) {
      for (let index = 0; index < this.updateShippingForm.getRawValue().products.length; index++) {
        UID = UID + '-' + this.updateShippingForm.getRawValue().products[index].product.id;
      }
      this._label.exportToLabel(this.updateShippingForm.getRawValue(), this.addressSelected, UID).then(() => {
        this.isLoadingLabel = false;
      });
    }

  }

  goToFragment() {
    if (this.updateShippingForm.getRawValue().id) {
      this._router.navigate(["/fragment/" + this.updateShippingForm.getRawValue().id]);
      this.modalService.dismissAll();
    } else {
      return;
    }
  }

  closeModale(): void {
    this.modalService.dismissAll();
  }

  updateShipping() {

    if (this.status == 2) {
      if (this.updateShippingForm.controls.guide_number.value == '' || this.updateShippingForm.controls.guide_number.value == null ||
        this.updateShippingForm.controls.conveyor.value == '' || this.updateShippingForm.controls.conveyor.value == null) {
        Swal.fire('Numero de guia y transportadora requerido', '', 'info');
        return
      }
    }
    this.updateShippingForm.controls.products.enable();
    if (this.updateShippingForm.valid && this.updateShippingForm.value.products.length > 0) {
      const delivery_date = new Date(
        this.updateShippingForm.getRawValue().delivery_date.year,
        this.updateShippingForm.getRawValue().delivery_date.month - 1,
        this.updateShippingForm.getRawValue().delivery_date.day
      );
      this.isLoading = true;
      this._orderService
        .updateShipping(updateShipping({
          ...this.updateShippingForm.getRawValue(),
          deleted_products: this.deleted_products,
          delivery_date,
          status: (this.status == 2) ? 3 : this.status
        })).subscribe((res: any) => {
          this.modalService.dismissAll();
          this.getTransactions.emit(true);
          this._notify.show('Orden de envio Actualizada.', '', 'success');
        }, err => {
          this.isLoading = false;
          this._notify.show('Error', 'No pudimos actualizar la orden, intenta de nuevo.', 'error');
          throw err;
        });
    } else {
      this._notify.show('', 'Revisa el formulario hay campos requeridos incompletos.', 'info');
    }
  }

}
