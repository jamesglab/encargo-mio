import { Injectable } from '@angular/core';
import { EncryptTools } from 'src/app/_helpers/tools/encrypt.tool';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storage = localStorage;
  private encryptTools: EncryptTools = new EncryptTools();

  constructor() { }

  getItem(key: string) {
    const itemEncripted = this.storage.getItem(key);
    if (!itemEncripted) { return null; }
    return this.encryptTools.desencrypt(itemEncripted);
  }

  getItemNoEncrypt(key: string): any {
    return this.storage.getItem(key);
  }

  setItem(key: string, value: any) {
    this.storage.setItem(key, this.encryptTools.encrypt(value));
  }

  setItemNoEncrypt(key: string, value: any) {
    this.storage.setItem(key, value);
  }

  removeItem(key: string) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }

  version(): any {
    let config = require("../../assets/version.json");
    return config;
  }

}
