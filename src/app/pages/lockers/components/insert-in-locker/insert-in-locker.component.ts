import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FileHandle } from 'src/app/_directives/file-handle';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { ImageCompressService } from 'src/app/_services/image-compress.service';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-insert-in-locker',
  templateUrl: './insert-in-locker.component.html',
  styleUrls: ['./insert-in-locker.component.scss']
})

export class InsertInLockerComponent implements OnInit {

  public formInsertLocker: FormGroup;

  public isLoading: boolean = false;

  constructor(
    public _fb: FormBuilder,
    private _notify: NotifyService,
    private _compress: ImageCompressService
  ) { }

  ngOnInit(): void {
    this.formInsertLocker = this._fb.group({
      guide_number: [null, [Validators.required]],
      locker: [null, [Validators.required]],
      conveyor: [null, [Validators.required]],
      receipt_date: [null, [Validators.required]],
      reason: [null, [Validators.required]],
      products: this._fb.array([]),
    });
  }

  get form() {
    return this.formInsertLocker.controls;
  }

  addItem(): void {
    this.product().push(this.newItem());
    console.log(this.product());
  }

  newItem(): FormGroup {
    return this._fb.group({ name: null, observations: null, product_value: 0, quantity: 0, weight: 0, category: null, color: null, capacity: null, size: null, novelty_article: false, free_shipping: false, force_commercial_shipping: false, images: [], invoice: [] })
  }

  product(): FormArray {
    return this.formInsertLocker.get('products') as FormArray;
  }

  filesDropped(file: FileHandle[], position: number) { // Método el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes('image')) {
      this._compress.compressImage(file[0].base64).then((res: any) => {
        // this.products.controls[position]['controls'].uploadedFiles.setValue(res);
        this.createFormData(res, position);
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
    } else {
      this._notify.show('', 'El archivo que seleccionaste no es una imagen.', 'info');
    }
  }

  uploadImage(position: number) {
    this._compress.uploadImage().then((res) => {
      // this.products.controls[position]['controls'].uploadedFiles.setValue(res);
      this.createFormData(res, position);
    }, err => {
      this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  createFormData(res: any, position: number) {
    // const formData = new FormData();
    // formData.append("image", res.file);
    // formData.append("payload", this.products.controls[position].value.key_aws_bucket);
    // this.isLoading = true;
    // this._orders.uploadNewImage(formData).subscribe((res: any) => {
    //   this.products.controls[position]['controls'].image.setValue(res.Location);
    //   this.products.controls[position]['controls'].key_aws_bucket.setValue(res.Key);
    //   this.isLoading = false;
    // }, err => {
    //   this.isLoading = false;
    //   this._notify.show('', 'Ocurrió un error al intentar guardar la imagen, intenta de nuevo.', 'error');
    //   throw err;
    // });
  }


  numberOnly($event): boolean { return numberOnly($event); } // Función para que sólo se permitan números en un input

  onSubmit(): void {
    this.addItem();
    if (this.formInsertLocker.valid) {

      return;
    }
  }

}