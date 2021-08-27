import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

export class NotifyService {

  constructor() { }

  show(title: string, message: string, type: any) {
    Swal.fire(`${title}`, `${message}`, type);
  }

}
