import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CuponsService } from '../services/cupons.service';

@Component({
  selector: 'app-cupons',
  templateUrl: './cupons.component.html',
  styleUrls: ['./cupons.component.scss']
})
export class CuponsComponent implements OnInit {
  counts;
  cupons;
  cuponSelected;
  constructor(
    private _cuponsService: CuponsService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getCupons();
  }

  getCupons() {
    this._cuponsService.getCupons().subscribe(res => {
      this.cupons = res;
    })
  }

  openModal(modal: any, sizeModale: string) {
    this.modalService.open(modal, { size: sizeModale, centered: true });
  }
  
}
