import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { Observable } from "rxjs-compat";
import { map, startWith } from "rxjs/operators";
import { NotifyService } from "src/app/_services/notify.service";
import { UserService } from "src/app/_services/users.service";


@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
})

export class TransactionComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Output() public filterValues: EventEmitter<any> = new EventEmitter();

  @Input() public status: string;
  @Input() public transactions: Array<{
    id?: string;
    estimeted_value?: number;
    trm?: string;
    created_at?: string;
    updated_at?: string;
    is_shipping_locker?: boolean;
  }>;
  public filterUser = new FormControl('');
  public filterId = new FormControl('');
  public filterDate = new FormControl({ value: '' });
  public filteredUsers: Observable<string[]>;
  public orderSelected: any = {};
  public isLoading: boolean = false;
  public users: [] = [];

  constructor(
    private modalService: NgbModal,
    public _notify: NotifyService,
    private _userService: UserService
  ) { }

  ngOnInit() {
    this.getUsersAdmin();
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
  }

  ngOnChanges() {
    // this.statusTab = this.status;
  }

  filterOrders() {
    const filterValues = {}
    if (this.filterId.value && this.filterId.value != '') {
      filterValues['id'] = this.filterId.value
    } if (this.filterDate?.value && this.filterDate.value.year) {
      filterValues['created_at'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    } if (this.filterUser.value != null && this.filterUser.value != '') {
      filterValues['user'] = this.filterUser.value.id;
    }
    this.filterValues.emit(filterValues);
  }

  getUsersAdmin() {
    this._userService.getUsersAdmin().subscribe(users => {
      this.users = users;
    }, err => {
      throw err;
    });
  }
  openModal(order: any, modal: any, sizeModale: string) {
    this.modalService.open(modal, { size: sizeModale, centered: true });
    this.orderSelected = order
    this.orderSelected.trm = 0;
  }

  _filter(value: string, array: any): string[] {
    const filterValue = this._normalizeValue(value, array);
    let fileterdData = this[array].filter(option => this._normalizeValue(option, array).includes(filterValue));
    if (fileterdData.length > 0) {
      return fileterdData;
    } else {
      return this[array];
    }
  }

  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
  }


  formatDate() {
    if (this.filterDate.value.year) {
      return moment(new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)).format('YYYY/MM/DD')
    } else {
      return ''
    }
  }

  private _normalizeValue(value: any, array: any): string {
    if (typeof value === 'object') {
      if (array === 'conveyors') {
        return value.name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'users') {
        return value.full_name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'address') {
        return value.address.toLowerCase().replace(/\s/g, '');
      }
    } else {
      return value.toLowerCase().replace(/\s/g, '');
    }
  }

}
