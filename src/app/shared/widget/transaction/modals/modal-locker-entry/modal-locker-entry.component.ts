import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { insertInLocker } from 'src/app/_helpers/tools/create-order-parse.tool';

@Component({
  selector: 'app-modal-locker-entry',
  templateUrl: './modal-locker-entry.component.html',
  styleUrls: ['./modal-locker-entry.component.scss']
})

export class ModalLockerEntryComponent implements OnInit {

  @Output() refreshTable = new EventEmitter<any>();

  public isLoading: boolean = false;
  public getQueries: boolean = false;
  public lockers = [];
  public orders_purchase: [] = [];
  public conveyors: [] = [];
  public lockerForm: FormGroup;
  public files: File[] = [];
  public allGuides: any[] = [];

  constructor(
    public modalService: NgbModal,
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,
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
      shipping_value: [0, [Validators.required]],
      declared_value_admin: [0, [Validators.required]],
      conveyor: [null, [Validators.required]],
      force_commercial_shipping: [false],
      product_observations: [null]
    });
    this.lockerForm.controls.guide_number.valueChanges.subscribe((guide: any) => {
      if (guide && guide.guide_number) {
        this.lockerForm.controls.guide_order.setValue((guide.id + ' | ' + guide.product.name));
        this.lockerForm.controls.guide_number.setValue(guide.guide_number);
        this.lockerForm.controls.order_purchase.setValue(guide.id);
        this.lockerForm.controls.locker.setValue(guide.locker.id);
        this.lockerForm.controls.locker_info.setValue(`CA${(guide.locker.id ? guide.locker.id : 0)} | ${guide.user.name} ${guide.user.last_name}`);
        this.lockerForm.controls.weight.setValue((guide.weight ? guide.weight : 0));
        this.lockerForm.controls.declared_value_admin.setValue((guide.product_price ? guide.product_price : 0));
        this.lockerForm.controls.product.setValue((guide.product.id ? guide.product.id : 0));
      }
    });
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

  // getLockerByUser() {
  //   this._orderService.getLockerByUser({ user: this.orderSelected.user.id }).subscribe((res: any) => { // ASIGNAMOS EL LOCKER DEL USUARIO... PUEDEN EXISTIR MAS LOCKERS
  //     this.lockers.push(res);
  //   })
  // }

  // getPurchaseByOrder() {
  //   this._orderService.getPurchaseByOrder({ order_service: this.orderSelected.id }).subscribe(res => { // ADINGNAMOS LAS ORDENES QUE TIENEN LOS PRODUCTOS
  //     this.orders_purchase = res;
  //   });
  // }

  createReceiptDate(date) { //Formato de fechas recibidas
    return new Date(date.year, date.month, date.day);
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

  closeModal(): void { // Función para cerrar el modal
    this.modalService.dismissAll();
  }

  addLocker(): void {

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
        console.log(res);
        this._notify.show(`Producto #${this.lockerForm.getRawValue().order_purchase.replace(/=/g, "")} Agregado`, res.message, "success");
        this.refreshTable.emit(true);
        this.modalService.dismissAll();
        this.isLoading = false;
      }, err => {
        this._notify.show("Error", err.error ? err.error.message : "Ocurrió un error al intentar registrar el producto.", "warning");
        this.isLoading = false;
        throw err;
      });

  }

}
