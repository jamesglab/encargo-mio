import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { NgxImageCompressService } from 'ngx-image-compress';

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

  constructor(private _orderService: OrderService, private imageCompress: NgxImageCompressService) { }

  ngOnInit(): void {
  }

  preview() {
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.loaderImage = true;
      this.imgURL = null;
      this.imageCompress.compressFile(image, orientation, 75, 50).then(
        result => {
          this.imgURL = result;
          this.loaderImage = false;
        }
      );
    });
  }

  createImage() {
    const formData = new FormData();
    const imageBlob = this.dataURItoBlob(this.imgURL.split(',')[1]);
    formData.append('image', imageBlob);
    formData.append('id', this.product.id);
    this.isLoading = true;
    this._orderService.updateImageByProduct(formData).subscribe(res => {
      this.imageUpdated.emit(res.image);
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
