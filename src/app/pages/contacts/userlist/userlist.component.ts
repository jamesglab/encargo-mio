import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs-compat';
import { map, startWith } from 'rxjs/operators';
import { UserService } from "src/app/_services/users.service";
import { RolesService } from '../_services/roles.service';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss']
})

/**
 * Contacts user-list component
 */
export class UserlistComponent implements OnInit {
  // bread crumb items
  public users = [];
  public usersTable = [];
  public filterEmail = new FormControl('');
  public filterName = new FormControl('');
  public filterLocker = new FormControl('');

  public filteredUsers: Observable<string[]>;
  public userSelected: any;
  public counts = 100;
  public roles = [];

  constructor(private _userService: UserService,
    private _roleService: RolesService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.getUsers();
  }


  getUsers(pagination?) {
    this._userService.getUsersAdminPaginate({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
      ...this.filterValues()
    }).subscribe(res => {
      this.usersTable = res.users;
      this.counts = res.count
    });
  }

  filterValues() {
    const filter = {}
    if (this.filterName.value != '') {
      filter['name'] = this.filterName.value;
    }
    if (this.filterEmail.value != '') {
      filter['email'] = this.filterEmail.value;
    } if (this.filterLocker.value != '') {
      filter['locker'] = this.filterLocker.value;
    }
    return filter;
  }

  getRoles() {
    this._roleService.getRoles().subscribe(res => {
      this.roles = res;
    })
  }

  openModal(content: any, user) {
    this.userSelected = user; this._userService.getUserById(user.id).subscribe(res => {
      this.userSelected = res
      this.modalService.open(content, { size: 'lg', centered: true });
    })
  }

  closeModal(modal) {
    modal.close('Close click');
    this.getUsers();
  }
}
