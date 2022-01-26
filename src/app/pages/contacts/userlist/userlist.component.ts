import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { UserService } from "src/app/_services/users.service";
import { RolesService } from '../_services/roles.service';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss']
})

export class UserlistComponent implements OnInit {

  public users = [];
  public usersTable = [];
  public roles = [];

  public filterEmail = new FormControl('');
  public filterName = new FormControl('');
  public filterLocker = new FormControl('');

  public filteredUsers: Observable<string[]>;
  public userSelected: any;
  public counts: number = 100;

  constructor(
    private _userService: UserService,
    private _roleService: RolesService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(pagination?: any) {
    this._userService.getUsersAdminPaginate({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
      ...this.filterValues()
    }).subscribe(res => {
      this.usersTable = res.users;
      this.counts = res.count
    }, err => {
      throw err;
    });
  }

  filterValues() {
    const filter: any = {};
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
    this._roleService.getRoles()
      .subscribe((res: any) => {
        this.roles = res;
      }, err => {
        throw err;
      });
  }

  addUser(template: any) {
    this.modalService.open(template, { size: 'md', centered: true });
  }

  openModal(content: any, user: any) {
    this.userSelected = user;
    this._userService.getUserById(user.id)
      .subscribe((res: any) => {
        this.userSelected = res
        this.modalService.open(content, { size: 'lg', centered: true });
      }, err => {
        throw err;
      });
  }

  closeModal(modal: any) {
    modal.close('Close click');
    this.getUsers();
  }

}
