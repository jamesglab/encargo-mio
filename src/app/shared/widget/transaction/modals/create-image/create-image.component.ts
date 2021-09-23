import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-create-image',
  templateUrl: './create-image.component.html',
  styleUrls: ['./create-image.component.scss']
})
export class CreateImageComponent implements OnInit {

  @Input() product;
  @Output() close = new EventEmitter<any>();
  @Output() imageUpdated = new EventEmitter<any>();
  isLoading = false;
  loaderImage = false;
  imgURL;

  constructor(private _orderService: OrderService,
    private imageCompress: NgxImageCompressService,
    private _notifyService : NotifyService
    ) { }

  ngOnInit(): void {
  }

  preview() {
    // ACCEDEMOS A LAS IMAGENES
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      // PONEMOS EL LOADER DEPENDIENDO DE LO QUE TARDE LA COMPRESION DE LA IMAGEN
      this.loaderImage = true;
      // PONEMOS LA IMAGEN EN NULL POR SI LA CAMBIAN PARA PODER VISUALIZAR EL LOADER
      this.imgURL = null;
      // COMPIMIMOS LA IMAGEN PONIENDOLE LA ORIENZACION QUE TRAIGA
      this.imageCompress.compressFile(image, orientation, 75, 50).then(
        result => {
          // CREAMOS LA IMAGEN
          this.imgURL = result;
          this.loaderImage = false;
        }
      );
    });
  }

  createImage() {
    if (!this.imgURL){
      // MOSTRAMOS ERROR POR SI NO HAN SELECCIONADO IMAGEN
      this._notifyService.show('Error','Selecciona una imagen','warning')
      return
    }
    // ABRIMOS EL FORM DATA
    const formData = new FormData();
    //CREAMOS LA IMAGEN DEL DATA URI PARA OBETNER LA IMAGEN EN TIPO ARCHIVO Y NO BASE 64 
    const imageBlob = this.dataURItoBlob(this.imgURL.split(',')[1]);
    //ANEXAMOS  LA IMAGEN EN EL FORM DATA 
    formData.append('image', imageBlob);
    // ANEXAMOS EL ID DEL PRODUCTO
    formData.append('id', this.product.id);
    this.isLoading = true;
    // ACTAUALIZAMOS LA IMAGEN
    this._orderService.updateImageByProduct(formData).subscribe(res => {
      this.imageUpdated.emit(res.image);
    },err=>{
      this._notifyService.show('Error','No se pudo actualizar la imagen del producto','error')
    })
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  closeModale() {
    this.close.emit(true);
  }

}
