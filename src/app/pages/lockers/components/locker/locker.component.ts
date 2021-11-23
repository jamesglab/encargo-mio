import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
  styleUrls: ['./locker.component.scss']
})

export class LockerComponent implements OnInit {

  public isLoading: boolean = false;
  public refreshTable: boolean = false;
  public showData: boolean = true;

  constructor(
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
  }

  openModal(content: any) {
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  resetFilters() {
    this.showData = false;
    setTimeout(() => {
      this.showData = true;
    }, 300);

  }

  refreshTableReceive(event: any): void {
    this.refreshTable = event;
  }

}
