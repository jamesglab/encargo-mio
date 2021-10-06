import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lockers-table',
  templateUrl: './lockers-table.component.html',
  styleUrls: ['./lockers-table.component.scss']
})

export class LockersTableComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Input() public lockers: any = [];

  public lockerSelected: any = {};

  constructor(
    public modalService: NgbModal
  ) { }

  ngOnInit(): void { }

  viewDetail(locker: any, modal: any, sizeModale: string) {
    this.lockerSelected = locker;
    this.modalService.open(modal, { size: sizeModale, centered: true });
  }

  closeModalEditLockers(event: any) {
    if (!event) {
      this.modalService.dismissAll();
      this.refreshTable.emit(true);
    }
  }

  cancelModalReceive(event?: any) {
    this.modalService.dismissAll();
  }

}
