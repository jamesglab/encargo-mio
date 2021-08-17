import { Component, OnInit } from '@angular/core';
import { UserService } from "src/app/_services/users.service";

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
  public counts = 100;

  constructor(private _userService: UserService) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(pagination?) {
    this._userService.getUsersAdmin({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
    }).subscribe(res => {
      this.users = res.users;
      this.counts = res.count
    });
  }
}
