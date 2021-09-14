import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-locker-entry',
  templateUrl: './modal-locker-entry.component.html',
  styleUrls: ['./modal-locker-entry.component.scss']
})
export class ModalLockerEntryComponent implements OnInit {

  @Input() orderSelected;
  public isLoading: boolean;
  public lockers: [] = [];
  public orders: [] = [];
  public conveyors: [] = [];

  

  constructor(
    public modalService: NgbModal,

  ) { }

  ngOnInit(): void {
  }

  closeModale() {
    this.modalService.dismissAll();
  }

}
