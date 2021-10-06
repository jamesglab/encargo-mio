import { Component, OnInit } from '@angular/core';
import { LockersService } from '../../_services/lockers.service';

@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
  styleUrls: ['./locker.component.scss']
})

export class LockerComponent implements OnInit {

  public isLoading: boolean = false;
  public search: any;
  public counts: number = 0;
  public refreshTable: boolean = false;
  public isLoadInput: boolean = false;
  public lockers: any = [];

  constructor(
    private _lockers: LockersService
  ) { }

  ngOnInit(): void {
    this.getAllLockers();
  }

  getAllLockers(pagination?: any) {
    this.isLoading = true;
    this.isLoadInput = true;
    this._lockers.getAllLockers({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination?.pageIndex + 1 : 1
    }).subscribe((res: any) => {
      this.lockers = res.products;
      this.counts = res.count;
      this.isLoading = false;
      this.isLoadInput = false;
    }, err => {
      this.isLoading = false;
      this.isLoadInput = false;
      throw err;
    });
  }

  onSearch(event: any) {
    if (event.target.value.length >= 5) {
      this.isLoadInput = true;
      this._lockers.getDataByGuideNumber(event.target.value)
        .subscribe((res: any) => {
          this.lockers = res;
          this.counts = res.length;
          if (this.counts === 0) {
            this.getAllLockers();
          }
          this.isLoadInput = false;
        }, err => {
          this.isLoadInput = false;
          throw err;
        });
    }
  }

  refreshTableReceive(event): void {
    this.refreshTable = event;
    if (this.refreshTable) {
      this.getAllLockers();
    }
  }

}
