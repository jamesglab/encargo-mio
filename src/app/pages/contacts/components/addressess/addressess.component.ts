import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from "src/app/_services/users.service";

@Component({
  selector: 'app-addressess',
  templateUrl: './addressess.component.html',
  styleUrls: ['./addressess.component.scss']
})
export class AddressessComponent implements OnInit {

  public addressess: any[] = [];
  public user: any = null;
  private unsuscribe: Subscription[] = [];

  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
    this.obtainAddress();
  }

  obtainAddress(): void {
    const addressSubscr = this.userService.getAddressByUser({ id: this.route.snapshot.paramMap.get('id') })
    .subscribe(res => { 
      this.addressess = res.addressess;
      if(this.addressess[0]){
        this.user = this.addressess[0].user;
      } 
    }, err => { throw err; });
    this.unsuscribe.push(addressSubscr)
  }

  ngOnDestroy(){
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }

}
