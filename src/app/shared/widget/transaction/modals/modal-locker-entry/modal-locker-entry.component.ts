import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { dataURLtoFile, numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { insertInLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { map, startWith } from 'rxjs/operators';
import { LockersService } from 'src/app/pages/lockers/_services/lockers.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-modal-locker-entry',
  templateUrl: './modal-locker-entry.component.html',
  styleUrls: ['./modal-locker-entry.component.scss']
})

export class ModalLockerEntryComponent implements OnInit {

  @Output() refreshTable = new EventEmitter<any>();

  public lockerForm: FormGroup;
  public toHome = { status: false, to_home: false };
  public isLoading: boolean = false;
  public getQueries: boolean = false;
  public loaderLockers: boolean = false;
  public initLoad: boolean = false;
  public isAndroid: boolean = false;

  public lockers: any = [];
  public conveyors: any[] = [];
  public files: File[] = [];
  public allGuides: any[] = [];
  public allLockers: any[] = [];
  public allOrders: any[] = [];

  public filteredOrders: Observable<string[]>;
  public filteredConveyors: Observable<string[]>;

  constructor(
    public modalService: NgbModal,
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,
    private _lockers: LockersService,
    public _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initLoad = true;
    this.getConvenyors().then(() => {
      this.buildForm();
    });
    this.checkOperativeSystem();
  }

  checkOperativeSystem() {
    if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
      if (document.cookie.indexOf("iphone_redirect=false") == -1) {
        this.isAndroid = false;
      } else {
        this.isAndroid = true;
      }
    }
  }

  buildForm() {

    this.lockerForm = this.fb.group({
      guide_number: [null],
      guide_order: [null],
      order_purchase: [null],
      locker: [null, [Validators.required]],
      locker_info: [null, [Validators.required]],
      product: [null],
      product_description: [null],
      weight: [0, [Validators.required, Validators.min(0.1)]],
      receipt_date: [{ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }, [Validators.required]],
      permanent_shipping_value: [0],
      declared_value_admin: [0, [Validators.required, Validators.min(0.1)]],
      conveyor: [null, [Validators.required]],
      force_commercial_shipping: [false],
      product_observations: [null],
      user: [null]
    });

    this.lockerForm.controls.guide_order.disable();

    this.lockerForm.controls.guide_number.valueChanges.subscribe((guide: any) => {
      if (guide && guide.guide_number_alph) {
        this.pushConveyorSelected(guide.conveyor);
        this.allOrders = [];
        this.lockerForm.controls.guide_order.setValue((guide.order_service.id + ' | ' + guide.product.name));
        this.lockerForm.controls.guide_number.setValue(guide.guide_number_alph);
        this.lockerForm.controls.order_purchase.setValue(guide.id);
        this.lockerForm.controls.locker.setValue(guide.locker.id);
        this.lockerForm.controls.locker_info.setValue(`${guide.user.name} ${guide.user.last_name}`);
        this.lockerForm.controls.weight.setValue((guide.weight ? guide.weight : 0));
        this.lockerForm.controls.declared_value_admin.setValue((guide.product_price ? guide.product_price : 0));
        this.lockerForm.controls.product.setValue((guide.product.id ? guide.product.id : null));
        this.lockerForm.controls.product_description.setValue(guide.product.name ? guide.product.name : null);
        this.lockerForm.controls.user.setValue((guide.user.id ? guide.user.id : null));
        this.lockerForm.controls.permanent_shipping_value.setValue((guide.permanent_shipping_value ? guide.permanent_shipping_value : 0));
        this.pushImagesResponse(guide.product.image ? guide.product.image : null);
        this.getTypeShipping(guide);
      }
    });

    this.lockerForm.controls.locker_info.valueChanges.subscribe((data: any) => {
      if (data && data.locker_id) {
        this.lockerForm.controls.locker_info.setValue((`CA${data.locker_id} | ${data.us_name} ${data.us_last_name}`));
        this.lockerForm.controls.locker.setValue(data.locker_id);
        this.lockerForm.controls.user.setValue(data.us_id);
        this.autoCompleteUsers(data.us_id);
      }
    });

    this.lockerForm.controls.guide_order.valueChanges.subscribe((orderPurchase: any) => {
      if (orderPurchase && orderPurchase.id) {
        this.pushConveyorSelected(orderPurchase.conveyor);
        this.files = [];
        this.lockerForm.controls.guide_order.setValue((orderPurchase.order_service.id + ' | ' + orderPurchase.product.name));
        if (this.lockerForm.controls.guide_number.value === "" || this.lockerForm.controls.guide_number.value == null) {
          this.lockerForm.controls.guide_number.setValue(orderPurchase.guide_number_alph);
        }
        this.lockerForm.controls.order_purchase.setValue(orderPurchase.id);
        this.lockerForm.controls.weight.setValue((orderPurchase.weight ? orderPurchase.weight : 0));
        this.lockerForm.controls.declared_value_admin.setValue((orderPurchase.product_price ? orderPurchase.product_price : 0));
        this.lockerForm.controls.product.setValue((orderPurchase.product.id ? orderPurchase.product.id : null));
        this.lockerForm.controls.product_description.setValue(orderPurchase.product.name ? orderPurchase.product.name : null);
        this.lockerForm.controls.user.setValue((orderPurchase.order_service.user.id ? orderPurchase.order_service.user.id : null));
        this.lockerForm.controls.permanent_shipping_value.setValue((orderPurchase.permanent_shipping_value ? orderPurchase.permanent_shipping_value : 0));
        this.getTypeShipping(orderPurchase);
        this.pushImagesResponse(orderPurchase.product.image ? orderPurchase.product.image : null);
      } else if (typeof orderPurchase === 'string' && orderPurchase !== null && orderPurchase.length === 0) {
        this.cleanData();
      }
    });

    this.filteredOrders = this.lockerForm.controls.guide_order.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'allOrders')));
    this.filteredConveyors = this.lockerForm.controls.conveyor.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'conveyors')));

    this.initLoad = false;

  }

  get form() {
    return this.lockerForm.controls;
  }

  getConvenyors(): Promise<any> { // AGREGAMOS LAS TRANSPORTADORAS
    return new Promise((resolve, reject) => {
      this._orderService.getConvenyor()
        .subscribe((res: any) => {
          this.conveyors = res;
          resolve(this.conveyors);
        }, err => {
          reject(err);
          throw err;
        });
    });
  }

  pushConveyorSelected(data: any) {
    let filtered = this.conveyors.filter(x => x.id == data); // Buscamos el id de todas las transportadoras a través del id guardado en bd
    if (filtered) { // Si existen datos
      this.lockerForm.controls.conveyor.setValue(filtered[0]); //Seteamos el valor de conveyor con la respuesta del filtro.
    }
  }

  onSelect(event) { // AGREGAMOS LAS IMAGENES AL ARRAY DE FILES
    this.files.push(...event.addedFiles);
  }

  onRemove(event) { // ELIMINAMOS LA IMAGEN
    this.files.splice(this.files.indexOf(event), 1);
  }

  createReceiptDate(date) { //Formato de fechas recibidas
    return new Date(date.year, date.month - 1, date.day);
  }

  numberOnly(event): boolean { // Función para que sólo se permitan números en un input
    return numberOnly(event, this.isAndroid);
  }

  autoCompleteGuide(params: any) {
    this.getQueries = true; // Ponemos un botón de carga en todo el modal en verdadero
    this._orderService.getDataByGuide(params)
      .subscribe((res: any) => { // Obtenemos los datos por los params de guía
        this.allGuides = res; // Seteamos la respuesta del backend en el array de allGuides
        this._cdr.detectChanges();
        this.getQueries = false; // Ponemos un botón de carga en todo el modal en falso
      }, err => {
        this.getQueries = false; // Ponemos un botón de carga en todo el modal en falso
        throw err;
      });
  }

  getTypeShipping(data: any) {
    if (data.order_service) {
      this._lockers.getTypeOfShipping(data.order_service.id).subscribe((res: any) => {
        if (res) {
          this.toHome.status = true;
          this.toHome.to_home = res.to_home;
        }
      }, err => {
        throw err;
      });
    }
  }

  autoCompleteLocker(params: any) {
    if (params.length >= 2) {
      this.loaderLockers = true;
      this.getQueries = true;
      this._orderService.getUsersByName(params)
        .subscribe((res: any) => {
          this.allLockers = res;
          this.loaderLockers = false;
          this.getQueries = false;
          this._cdr.detectChanges();
        }, err => {
          this.loaderLockers = false;
          this.getQueries = false;
          throw err;
        });
    }
  }

  autoCompleteUsers(params: any) {
    this.getQueries = true;
    this.lockerForm.controls.guide_order.disable();
    this._orderService.getLockersByUser(params)
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.allOrders = res;
        }
        this.lockerForm.controls.guide_order.enable();
        this.getQueries = false;
      }, err => {
        this.lockerForm.controls.guide_order.disable();
        this.getQueries = false;
        throw err;
      });
  }

  cleanData() {
    this.allGuides = [];
    this.toHome = { status: false, to_home: false };
    this.lockerForm.controls.product_description.setValue(null);
    this.lockerForm.controls.weight.setValue(0);
    this.lockerForm.controls.permanent_shipping_value.setValue(0);
    this.lockerForm.controls.declared_value_admin.setValue(0);
  }

  private _filter(value: any, array: any): string[] {

    if (typeof value === 'string' && value !== null) { // Si el valor es un string y es diferente a nulo

      const filterValue = value.toLowerCase(); // El valor filtrado se convertirá a toLowerCase
      let filtered: any = null; // Se asgina un valor para almacenar la data a través del filtro

      if (array === 'allOrders') { // Si el arreglo es allOrders filtrará por option.product.name
        filtered = this[array].filter(option => option.product.name.toLowerCase().includes(filterValue));
      } else if (array === 'conveyors') { // Si el arreglo es conveyors filtrará por option.name
        filtered = this[array].filter(option => option.name.toLowerCase().includes(filterValue));
      }

      if (filtered && filtered.length > 0) { // Si después de filtrar el length es mayor a 0 retornamos la data del arreglo
        return filtered;
      } else { // Si es cero entonces retornarmos el arreglo completo
        return this[array];
      }

    } else { // Donde no cumpla ninguan de las dos condiciones se retorna el arreglo completo
      return this[array];
    }

  }

  displayFn(option: any) { if (option) { return option ? option : `${option.id} | ${option.product.name}`; } }

  displayConveyors(option: any) { return option ? option.name : ''; } // Formato para mostrar simplemente el nombre en el autocomplete

  pushImagesResponse(image: any): void { // Pusheamos las imagenes que están guardadas en la base de datos.
    if (image) {
      const toDataURL = url => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))
      toDataURL(image)
        .then(dataUrl => {
          var fileData = dataURLtoFile(dataUrl, "imagen.jpg");
          this.files.push(fileData);
        });
    }
  }

  closeModal(): void { // Función para cerrar el modal
    this.modalService.dismissAll();
  }

  addLocker(): void {

    if (this.lockerForm.invalid) {
      this._notify.show('', 'El formulario no se ha completado correctamente.', 'info');
      return;
    }

    var formData = new FormData();

    if (this.files && this.files.length > 0) {
      this.files.forEach((file) => { formData.append('images', file) });  // AGREGAMOS AL CAMPO FILE LAS IMAGENES QUE EXISTAN ESTO CREARA VARIOS ARCHIVOS EN EL FORMDATA PERO EL BACKEND LOS LEE COMO UN ARRAY
    }

    let payload = insertInLocker(this.lockerForm.getRawValue());

    formData.append("payload", JSON.stringify(payload)); // AGREGAMOS LOS CAMPOS DEL FORMULARIO A UN NUEVO OBJETO
    this.isLoading = true;
    this._orderService.insertProductLocker(formData)  // CONSUMIMOS EL SERVICIO DEL BACK PARA INGRESAR EL PRODUCTO 
      .subscribe((res: any) => {
        this._notify.show('', res.message, "success");
        this.refreshTable.emit(true);
        this.modalService.dismissAll();
        this.isLoading = false;
      }, err => {
        this._notify.show('', err.error ? err.error.message : "Ocurrió un error al intentar registrar el producto.", "info");
        this.isLoading = false;
        throw err;
      });

  }

}
