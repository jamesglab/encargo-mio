import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { dataURLtoFile, numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { insertInLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { Observable } from 'rxjs-compat';
import { map, startWith } from 'rxjs/operators';
import { LockersService } from 'src/app/pages/lockers/_services/lockers.service';

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

  public lockers = [];
  public orders_purchase: [] = [];
  public conveyors: [] = [];
  public files: File[] = [];
  public allGuides: any[] = [];
  public allLockers: any[] = [];
  public allOrders: any[] = [];

  public filteredOrders: Observable<string[]>;

  constructor(
    public modalService: NgbModal,
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,
    private _lockers: LockersService,
    public _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getConvenyors();
  }

  buildForm() {

    this.lockerForm = this.fb.group({
      guide_number: [null, [Validators.required]],
      guide_order: [null],
      order_purchase: [null, [Validators.required]],
      locker: [null, [Validators.required]],
      locker_info: [null],
      product: [null],
      product_description: [null],
      weight: [0, [Validators.required]],
      receipt_date: [null, [Validators.required]],
      permanent_shipping_value: [0],
      declared_value_admin: [0, [Validators.required]],
      conveyor: [null, [Validators.required]],
      force_commercial_shipping: [false],
      product_observations: [null],
      user: [null]
    });

    this.lockerForm.controls.guide_order.disable();

    this.lockerForm.controls.guide_number.valueChanges.subscribe((guide: any) => {
      if (guide && guide.guide_number) {
        this.allOrders = [];
        this.lockerForm.controls.guide_order.setValue((guide.id + ' | ' + guide.product.name));
        this.lockerForm.controls.guide_number.setValue(guide.guide_number);
        this.lockerForm.controls.order_purchase.setValue(guide.id);
        this.lockerForm.controls.locker.setValue(guide.locker.id);
        this.lockerForm.controls.locker_info.setValue(`CA${(guide.locker.id ? guide.locker.id : 0)} | ${guide.user.name} ${guide.user.last_name}`);
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
      if (data && data.id) {
        this.cleanData();
        this.lockerForm.controls.locker_info.setValue((`CA${data.locker.id} | ${data.name} ${data.last_name}`));
        this.lockerForm.controls.locker.setValue(data.locker.id);
        this.lockerForm.controls.user.setValue(data.id);
        this.autoCompleteUsers(data.id);
      }
    });

    this.lockerForm.controls.guide_order.valueChanges.subscribe((guide: any) => {
      if (guide && guide.id) {
        this.lockerForm.controls.guide_order.setValue((guide.id + ' | ' + guide.product.name));
        this.lockerForm.controls.guide_number.setValue(guide.guide_number);
        this.lockerForm.controls.order_purchase.setValue(guide.id);
        this.lockerForm.controls.weight.setValue((guide.weight ? guide.weight : 0));
        this.lockerForm.controls.declared_value_admin.setValue((guide.product_price ? guide.product_price : 0));
        this.lockerForm.controls.product.setValue((guide.product.id ? guide.product.id : null));
        this.lockerForm.controls.product_description.setValue(guide.product.name ? guide.product.name : null);
        this.lockerForm.controls.user.setValue((guide.order_service.user.id ? guide.order_service.user.id : null));
        this.lockerForm.controls.permanent_shipping_value.setValue((guide.permanent_shipping_value ? guide.permanent_shipping_value : 0));
        this.getTypeShipping(guide);
        this.pushImagesResponse(guide.product.image ? guide.product.image : null);
      } else if (typeof guide === 'string' && guide !== null && guide.length === 0) {
        this.cleanData();
      }
    });

    this.filteredOrders = this.lockerForm.controls.guide_order.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

  }

  getConvenyors() { // AGREGAMOS LAS TRANSPORTADORAS
    this._orderService.getConvenyor().subscribe((res: any) => {
      this.conveyors = res;
    }, err => {
      throw err;
    });
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
    return numberOnly(event);
  }

  autoCompleteGuide(params: any) {
    if (params.length >= 5) { // Si el usuario escribe 5 o más de caracteres
      this.getQueries = true; // Ponemos un botón de carga en todo el modal en verdadero
      this.lockerForm.controls.guide_number.disable(); // Deshabilitamos el input del formulario
      this._orderService.getDataByGuide(params)
        .subscribe((res: any) => { // Obtenemos los datos por los params de guía
          this.allGuides = res; // Seteamos la respuesta del backend en el array de allGuides
          this._cdr.detectChanges();
          this.lockerForm.controls.guide_number.enable(); // Habilitamos nuevamente el campo de guía del formulario
          this.getQueries = false; // Ponemos un botón de carga en todo el modal en falso
        }, err => {
          this.lockerForm.controls.guide_number.enable();  // Habilitamos nuevamente el campo de guía del formulario
          this.getQueries = false; // Ponemos un botón de carga en todo el modal en falso
          throw err;
        });
    }
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
      this.getQueries = true;
      this.lockerForm.controls.locker_info.disable();
      this.lockerForm.controls.guide_order.disable();
      this._orderService.getUsersByName(params)
        .subscribe((res: any) => {
          this.allLockers = res;
          this.lockerForm.controls.locker_info.enable();
          this.lockerForm.controls.guide_order.enable();
          this.getQueries = false;
        }, err => {
          this.lockerForm.controls.locker_info.disable();
          this.lockerForm.controls.guide_order.disable();
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
        if (res.length > 0) {
          this.allOrders = res;
        } else {
          this._notify.show('', 'No hay ordenes asociadas al casillero.', 'info');
          this.cleanData();
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
    this.files = [];
    this.toHome = { status: false, to_home: false };
    this.lockerForm.controls.guide_number.setValue(null);
    this.lockerForm.controls.guide_order.setValue(null);
    this.lockerForm.controls.product_description.setValue(null);
    this.lockerForm.controls.weight.setValue(0);
    this.lockerForm.controls.permanent_shipping_value.setValue(0);
    this.lockerForm.controls.declared_value_admin.setValue(0);
  }

  private _filter(value: any): string[] {
    if (typeof value === 'string' && value !== null) {
      const filterValue = value.toLowerCase();
      return this.allOrders.filter(option => option.product.name.toLowerCase().includes(filterValue));
    } else {
      return this.allOrders;
    }
  }

  displayFn(option: any) {
    if (option) {
      return option ? option : `${option.id} | ${option.product.name}`;
    }
  }

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
    let payloadtxt = insertInLocker(this.lockerForm.getRawValue());
console.log('tenemos payload',payloadtxt)




    if (this.lockerForm.invalid) {
      this._notify.show('', 'El formulario no se ha completado correctamente.', 'info');
      return;
    }

    if (this.files.length === 0) {
      this._notify.show('', 'No has añadido imagenes al producto. (mínimo 1)', 'info');
      return;
    }

    var formData = new FormData();
    this.files.forEach((file) => { formData.append('images', file) });  // AGREGAMOS AL CAMPO FILE LAS IMAGENES QUE EXISTAN ESTO CREARA VARIOS ARCHIVOS EN EL FORMDATA PERO EL BACKEND LOS LEE COMO UN ARRAY
    let payload = insertInLocker(this.lockerForm.getRawValue());
    formData.append("payload", JSON.stringify(payload)); // AGREGAMOS LOS CAMPOS DEL FORMULARIO A UN NUEVO OBJETO
    this.isLoading = true;
    this._orderService.insertProductLocker(formData)  // CONSUMIMOS EL SERVICIO DEL BACK PARA INGRESAR EL PRODUCTO 
      .subscribe((res: any) => {
        this._notify.show(`Producto #${this.lockerForm.getRawValue().order_purchase.replace(/=/g, "")} Agregado`, res.message, "success");
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
