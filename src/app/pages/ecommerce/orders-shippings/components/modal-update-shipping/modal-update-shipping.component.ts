import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subscription } from "rxjs";
import { map, startWith } from "rxjs/operators";
import Swal from "sweetalert2"

import { LockersService } from "src/app/pages/lockers/_services/lockers.service";
import { updateShipping } from "src/app/_helpers/tools/create-order-parse.tool";
import { NotifyService } from "src/app/_services/notify.service";
import { UserService } from "src/app/_services/users.service";
import { ExportPdfService } from "../../../_services/export-pdf.service";
import { OrderService } from "../../../_services/orders.service";
import { OrderShippingService } from '../../_services/order-shipping.service';
import { DragdropService } from "../../_services/dragdrop.service";

import { numberOnly, validateShippingstatus } from 'src/app/_helpers/tools/utils.tool';

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

  public disabledInLocker: boolean = false;
  public disabledInShipping: boolean = false;

  public conveyors: any = [];
  public address: any = [];
  public products: any = [];
  public fractionedShippings: { [key: string]: string | number }[] = [];

  public inLocker: any = [];
  public outLocker: any = [];
  public newShipping: any = [];

  public shipping_types: [] = [];
  public deleted_products: any = [];
  public updateShippingForm: FormGroup;
  public addressSelected: any = {};

  public message: any = { status: false, await_products: false };

  public filteredConveyors: Observable<string[]>;
  public filteredAddress: Observable<string[]>;
  public filteredUsers: Observable<string[]>;

  private unsubscribe: Subscription[] = [];

  constructor(
    private _userService: UserService,
    private _lockers: LockersService,
    private _orderService: OrderService,
    private orderShippingService: OrderShippingService,
    private _formBuilder: FormBuilder,
    private _notify: NotifyService,
    public modalService: NgbModal,
    public _label: ExportPdfService,
    public _router: Router,
    private clipboard: Clipboard,
    private _dragdrop: DragdropService
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
      total_weight: [this.shippingToUpdate.total_weight],
      guide_number: [shipping.guide_number_alph, Validators.required],
      conveyor: [shipping.conveyor ? shipping.conveyor : null, [Validators.required]],
      // delivery_date: [{ day: parseInt(moment(shipping.delivery_date).format("D")), month: parseInt(moment(shipping.delivery_date).format("M")), year: parseInt(moment(shipping.delivery_date).format("YYYY")) }],
      total_value: [shipping.total_value, Validators.required],
      shipping_type: [shipping.shipping_type ? shipping.shipping_type.id : null, [Validators.required]],
      user: [shipping.user, Validators.required,],
      address: [shipping.address ? shipping.address : null, [Validators.required]],
      observations: [shipping.observations],
      products: [shipping.products ? shipping.products : null, Validators.required],
      consolidated: [shipping.consolidated ? shipping.consolidated : false]
    });

    this.updateShippingForm.controls.shipping_type.disable();
    this.updateShippingForm.controls.total_value.disable();

    this.filteredConveyors = this.updateShippingForm.controls.conveyor.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'conveyors')));
    this.filteredAddress = this.updateShippingForm.controls.address.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'address')));
    this.filteredUsers = this.updateShippingForm.controls.user.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));

    this.getInfoUser();
    if (this.shippingToUpdate.status == "6") { //ONLY FOR FRACTIONED
      this.getFractionedChildren();
    }
    this.disabledInputs();
  }

  get form() {
    return this.updateShippingForm.controls;
  }

  async getInfoUser() {

    await this._userService.getAddressByUser({ id: this.updateShippingForm.get("user").value.id })
      .subscribe((res: any) => {
        this.address = res;
      }, err => {
        throw err;
      });

    await this._lockers.getProductsInLocker({
      locker: this.updateShippingForm.controls.user.value.locker[0].id,
      shipping_id: this.updateShippingForm.controls.id.value
    }).subscribe((locker: any) => {
      this.inLocker = locker.in_locker;
      this.inLocker.map((item: any) => { item.button = false });
      this.outLocker = locker.in_shipping;
      this.outLocker.map((item: any) => { item.button = false });
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

  getFractionedChildren(): void { //GET FRACIONED CHILDREN
    const fractionedSubscr =
      this.orderShippingService.getFractionedChildren(this.shippingToUpdate.id)
        .subscribe(res => {
          this.fractionedShippings = res.fractioned_shippings;
        }, err => { throw new err; })
    this.unsubscribe.push(fractionedSubscr);
  }

  renderStatus(status: number): string {//USE THE CASE FUNCTION FOR RENDER STATUS OF FRACTION CHILDREN
    return validateShippingstatus(status);
  }

  drop(event: CdkDragDrop<string[]>, type: string) {

    let objProduct: any = event.previousContainer.data[event.previousIndex];

    if (objProduct.arrived) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        if (type === 'shipping') {
          this.disabledAllDrag();
          this._dragdrop.moveAddProduct({ shipping: this.shippingToUpdate.id, product: objProduct })
            .subscribe((res: any) => {
              transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
              this.enableAllDrag();
            }, err => {
              this.enableAllDrag();
              this._notify.show('', 'Hemos tenido un error al intentar mover el producto.', 'warning');
              throw err;
            });
        } else if (type === 'locker') {
          this.disabledAllDrag();
          this._dragdrop.removeAddProduct({ shipping: this.shippingToUpdate.id, product: objProduct.product.id })
            .subscribe((res: any) => {
              transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
              this.enableAllDrag();
            }, err => {
              this.enableAllDrag();
              this._notify.show('', 'Hemos tenido un error al intentar mover el producto.', 'warning');
              throw err;
            });
        } else if (type === 'new-shipping') {
          transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
      }
    } else {
      this._notify.show('', 'No puedes cambiar el estado debido a que el producto no ha llegado al casillero.', 'info');
    }

  }

  disabledAllDrag(): void {
    this.disabledInLocker = true;
    this.disabledInShipping = true;
  }

  enableAllDrag(): void {
    this.disabledInLocker = false;
    this.disabledInShipping = false;
  }

  disabledInputs(): void {
    if (this.shippingToUpdate.status != '0' && this.shippingToUpdate.status != '1') {
      for (const field in this.updateShippingForm.controls) {
        this.updateShippingForm.controls[field].enable();
      }
    } else {
      for (const field in this.updateShippingForm.controls) {
        if (field != 'total_weight') {
          this.updateShippingForm.controls[field].disable();
        }
      }
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
      return name ? 'CA ' + name.locker[0].id + ' | ' + name.name + ' ' + name.last_name : '';
    }
  }

  generateLabel() {
    this.isLoadingLabel = true;
    let UID: string = "";
    UID = this.updateShippingForm.getRawValue().id;
    if (this.updateShippingForm.getRawValue()) {
      for (let index = 0; index < this.updateShippingForm.getRawValue().products.length; index++) {
        let product = this.updateShippingForm.getRawValue().products[index];
        if (product.arrived) {
          UID += '-' + this.updateShippingForm.getRawValue().products[index].product.id
        }
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

  errorImage(event: any): void {
    event.target.src = 'assets/images/default.jpg';
  }

  numberOnly($event): boolean { return numberOnly($event); } // Función para que sólo se permitan números en un input

  closeModale(): void {
    this.modalService.dismissAll();
  }

  copyMessage(item: any) {
    if (item) {
      this.clipboard.copy(item);
      Swal.fire('Información copida. ', '', 'info');
    } else {
      Swal.fire('', 'No hay información a copiar.', 'error');
    }
  }

  disabledOrEnabled(array: any, type: boolean) {
    for (let index = 0; index < this[array].length; index++) {
      this[array][index].button = type;
    }
  }

  updateShippingPacked() {
    this.isLoading = true;
    this._orderService.updateShippingPacked({
      status: '2',
      id: this.shippingToUpdate.id,
      total_weight: this.updateShippingForm.getRawValue().total_weight
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

  updateShipping(): void {
    if (this.status == 2) {
      if (this.updateShippingForm.controls.guide_number.value == '' || this.updateShippingForm.controls.guide_number.value == null ||
        this.updateShippingForm.controls.conveyor.value == '' || this.updateShippingForm.controls.conveyor.value == null) {
        Swal.fire('Numero de guia y transportadora requerido', '', 'info');
        return;
      }
    }

    this.updateShippingForm.controls.products.enable();
    if (this.updateShippingForm.valid && this.updateShippingForm.value.products.length > 0) {
      this.updateConsolidate();
    } else {
      this._notify.show('', 'Revisa el formulario hay campos requeridos incompletos.', 'info');
    }
  }

  updateConsolidate(): void {
    this.isLoading = true;
    this._orderService
      .updateShipping(updateShipping({
        ...this.updateShippingForm.getRawValue(),
        deleted_products: this.deleted_products,
        status: (this.status == 2) ? 3 : this.status,
        newShipping: this.newShipping
      })).subscribe((res: any) => {
        this.modalService.dismissAll();
        this.getTransactions.emit(true);
        this._notify.show('Envío Actualizado.', '', 'success');
      }, err => {
        this.isLoading = false;
        this._notify.show('Error', 'No pudimos actualizar la orden, intenta de nuevo.', 'error');
        throw err;
      });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
