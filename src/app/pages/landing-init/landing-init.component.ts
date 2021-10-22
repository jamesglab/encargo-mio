import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-landing-init',
  templateUrl: './landing-init.component.html',
  styleUrls: ['./landing-init.component.scss']
})
export class LandingInitComponent implements OnInit {
  currentUser  = this._storageService.getItem('currentUser')
  constructor(private _storageService : StorageService ) { }

  ngOnInit(): void {
    console.log('current',this.currentUser,this._storageService.getItem('currenUser'))
  }

}
