import { Injectable } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';

@Injectable({
  providedIn: 'root'
})

export class ImageCompressService {

  constructor(private imageCompress: NgxImageCompressService) { }

  compressImage(base64: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageCompress.compressFile(base64, -1, 50, 50).then(result => {
        let obj = { url: result, file: this.dataURItoBlob(result.split(',')[1]), type: 'image/base64' };
        console.log(obj);
        resolve(obj);
        return obj;
      }, err => {
        reject(err);
        throw err;
      });
    });
  }

  uploadImage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageCompress.uploadFile().then(({ image }) => {
        this.compressImage(image).then((res) => {
          resolve(res);
        });
      }, err => {
        reject(err);
        throw err;
      });
    });
  }

  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

}
