import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { LockersService } from 'src/app/pages/lockers/_services/lockers.service';
import { FileHandle } from 'src/app/_directives/file-handle';
import { insertInLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { dataURLtoFile, numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { ImageCompressService } from 'src/app/_services/image-compress.service';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-locker-entry',
  templateUrl: './locker-entry.component.html',
  styleUrls: ['./locker-entry.component.scss']
})

export class LockerEntryComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Output() public closeModal: EventEmitter<any> = new EventEmitter<any>();

  @Input() public conveyors: any[] = [];
  @Input() public trm: any;
  @Input() public users: any = [];
  @Input() public purchaseSelected: any = {};

  public toHome = { status: false, to_home: false };

  public isLoading: boolean = false;
  public getQueries: boolean = false;
  public loaderLockers: boolean = false;
  public isLoadingUpload: boolean = false;
  public isAndroid: boolean = false;

  public lockerForm: FormGroup;

  public lockers: any = [];
  public files: any = [];
  public allGuides: any[] = [];
  public allLockers: any[] = [];
  public allOrders: any[] = [];

  public filteredOrders: Observable<string[]>;
  public filteredConveyors: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    public _notify: NotifyService,
    private _lockers: LockersService,
    public _cdr: ChangeDetectorRef,
    private _orderService: OrderService,
    private _compress: ImageCompressService,
    private _orders: OrderService
  ) { }

  ngOnInit(): void { this.checkOperativeSystem(); }

  checkOperativeSystem() {
    if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
      if (document.cookie.indexOf("iphone_redirect=false") == -1) {
        this.isAndroid = false;
      } else {
        this.isAndroid = true;
      }
    }
  }

  ngOnChanges() {
    if (this.purchaseSelected && !this.purchaseSelected.locker_has_product) {
      this.getTypeShipping(this.purchaseSelected);
      this.buildForm(this.purchaseSelected);
    } else {
      this._notify.show('', 'El producto ya ha sido ingresado a un casillero.', 'info');
      this.closeModalStatus();
      return;
    }
  }

  getTypeShipping(data: any) {
    if (data.order_service) {
      this._lockers.getTypeOfShipping(data.order_service).subscribe((res: any) => {
        if (res) {
          this.toHome.status = true;
          this.toHome.to_home = res.to_home;
        }
      }, err => {
        throw err;
      });
    }
  }

  buildForm(data: any): void {

    let searchConveyor: any = {};
    searchConveyor = this.conveyors.filter(x => x.id === data.conveyor);

    this.lockerForm = this.fb.group({
      guide_number: [data.guide_number_alph],
      guide_order: [data.invoice_number ? data.invoice_number : null],
      order_purchase: [data.id],
      locker: [{ id: data.locker_id }, [Validators.required]],
      locker_info: [{ value: (`CA ${data.locker_id} | ${data.user_name} ${data.last_name}`), disabled: true }],
      product: [data.product_id],
      product_description: [data.product_name],
      weight: [data.weight ? data.weight : 0, [Validators.required, Validators.min(0.1)]],
      receipt_date: [{ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }, [Validators.required]],
      permanent_shipping_value: [data.permanent_shipping_value ? data.permanent_shipping_value : 0],
      declared_value_admin: [data.product_price, [Validators.required, Validators.min(0.1)]],
      conveyor: [searchConveyor ? searchConveyor[0] : null, [Validators.required]],
      force_commercial_shipping: [data.force_commercial_shipping ? data.force_commercial_shipping : false],
      product_observations: [data.product_observations],
      user: [data.user_id]
    });

    this.lockerForm.controls.guide_number.valueChanges.subscribe((guide: any) => {
      if (guide && guide.guide_number) {
        this.allOrders = [];
        this.lockerForm.controls.guide_order.setValue((guide.order_service.id + ' | ' + guide.product.name));
        this.lockerForm.controls.guide_number.setValue(guide.guide_number_alph);
        this.lockerForm.controls.order_purchase.setValue(guide.id);
        this.lockerForm.controls.locker.setValue(guide.locker.id);
        this.lockerForm.controls.locker_info.setValue(`${guide.user.name} ${guide.user.last_name}`);
        this.lockerForm.controls.weight.setValue((guide.weight ? guide.weight : 0));
        this.lockerForm.controls.declared_value_admin.setValue((guide.product_price ? guide.product_price : 0));
        this.lockerForm.controls.product.setValue((guide.product.id ? guide.product.id : null));
        //this.lockerForm.controls.product_description.setValue(guide.product.name ? guide.product.name : null);
        this.lockerForm.controls.user.setValue((guide.user.id ? guide.user.id : null));
        this.lockerForm.controls.permanent_shipping_value.setValue((guide.permanent_shipping_value ? guide.permanent_shipping_value : 0));
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
        this.files = [];
        this.lockerForm.controls.guide_order.setValue((orderPurchase.order_service.id + ' | ' + orderPurchase.product.name));
        this.lockerForm.controls.guide_number.setValue(orderPurchase.guide_number_alph);
        // if (this.lockerForm.controls.guide_number_alph.value === "" || this.lockerForm.controls.guide_number_alph.value == null) {
        //   this.lockerForm.controls.guide_number_alph.setValue(orderPurchase.guide_number_alph);
        // }
        this.lockerForm.controls.order_purchase.setValue(orderPurchase.id);
        this.lockerForm.controls.weight.setValue((orderPurchase.weight ? orderPurchase.weight : 0));
        this.lockerForm.controls.declared_value_admin.setValue((orderPurchase.product_price ? orderPurchase.product_price : 0));
        this.lockerForm.controls.product.setValue((orderPurchase.product.id ? orderPurchase.product.id : null));
        //this.lockerForm.controls.product_description.setValue(orderPurchase.product.name ? orderPurchase.product.name : null);
        this.lockerForm.controls.user.setValue((orderPurchase.order_service.user.id ? orderPurchase.order_service.user.id : null));
        this.lockerForm.controls.permanent_shipping_value.setValue((orderPurchase.permanent_shipping_value ? orderPurchase.permanent_shipping_value : 0));
        this.getTypeShipping(orderPurchase);
      } else if (typeof orderPurchase === 'string' && orderPurchase !== null && orderPurchase.length === 0) {
        this.cleanData();
      }
    });

    this.filteredOrders = this.lockerForm.controls.guide_order.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'allOrders')));
    this.filteredConveyors = this.lockerForm.controls.conveyor.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'conveyors')));

  }

  get form() {
    return this.lockerForm.controls;
  }

  autoCompleteLocker(params: any): void {
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

  autoCompleteUsers(params: any): void {
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

  autoCompleteGuide(params: any): void {
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

  cleanData(): void {  //Creamos esta función para limpiar el formulario
    this.allGuides = [];
    this.toHome = { status: false, to_home: false };
    this.lockerForm.controls.product_description.setValue(null);
    this.lockerForm.controls.weight.setValue(0);
    this.lockerForm.controls.permanent_shipping_value.setValue(0);
    this.lockerForm.controls.declared_value_admin.setValue(0);
  }

  displayFn(option: any) { if (option) { return option ? option : `${option.id} | ${option.product.name}`; } }

  displayConveyors(option: any) { return option ? option.name : ''; } // Formato para mostrar simplemente el nombre en el autocomplete

  numberOnly(event): boolean { return numberOnly(event, this.isAndroid); } // Función para que sólo se permitan números en un input

  onImageError(event: any): void { event.target.src = "https://i.imgur.com/riKFnErh.jpg"; } // Image failure method

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

  filesDropped(file: FileHandle[]) { // Método el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes('image')) {
      this._compress.compressImage(file[0].base64).then((res: any) => {
        this.files.push(file[0]);
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
    } else {
      this._notify.show('', 'El archivo que seleccionaste no es una imagen.', 'info');
    }
  }

  uploadImage(): void { // Creamos este método para que al dar clic en subir archivo pase primero por el serivicio de comprimirla
    this._compress.uploadImage().then((res: any) => {
      this.files.push(res);
    }, err => {
      this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  // createFormData(res: any) { // Creamos este método para crear el form data de cada imagen que se sube.

  //   const formData = new FormData();
  //   formData.append("image", res.file);

  //   this.isLoading = true;
  //   this.isLoadingUpload = true;

  //   this._orders.uploadNewImage(formData).subscribe((res: any) => {
  //     this.files.push({ image: res.Location, key_aws_bucket: res.Key });
  //     this.isLoadingUpload = false;
  //     this.isLoading = false;
  //   }, err => {
  //     this.isLoadingUpload = false;
  //     this.isLoading = false;
  //     this._notify.show('', 'Ocurrió un error al intentar guardar la imagen, intenta de nuevo.', 'error');
  //     throw err;
  //   });
  // }

  closeModalStatus(): void {
    this.closeModal.emit(false);
  }

  registerInLocker(): void {

    if (this.lockerForm.invalid) {
      this._notify.show('', 'El formulario no se ha completado correctamente.', 'info');
      return;
    }

    var formData = new FormData();

    if (this.files && this.files.length > 0) {
      this.files.map((item: any) => {
        formData.append('images', item.file);
      });  // AGREGAMOS AL CAMPO FILE LAS IMAGENES QUE EXISTAN ESTO CREARA VARIOS ARCHIVOS EN EL FORMDATA PERO EL BACKEND LOS LEE COMO UN ARRAY
    }

    let payload = insertInLocker(this.lockerForm.getRawValue());
    formData.append("payload", JSON.stringify(payload)); // AGREGAMOS LOS CAMPOS DEL FORMULARIO A UN NUEVO OBJETO
    this._orderService.insertProductLocker(formData)  // CONSUMIMOS EL SERVICIO DEL BACK PARA INGRESAR EL PRODUCTO 
      .subscribe((res: any) => {
        this._notify.show('', res.message, "success");
        this.closeModal.emit(false);
        this.refreshTable.emit(true);
        this.isLoading = false;
      }, err => {
        this._notify.show('', err.error ? err.error.message : "Ocurrió un error al intentar registrar el producto.", "info");
        this.isLoading = false;
        throw err;
      });
  }

}
