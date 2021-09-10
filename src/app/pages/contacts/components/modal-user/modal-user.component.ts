import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from "src/app/_services/users.service";
import { Subscription } from 'rxjs';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-modal-user',
  templateUrl: './modal-user.component.html',
  styleUrls: ['./modal-user.component.scss']
})
export class ModalUserComponent implements OnInit {

  @Input() user: any;
  // @Input() roles: any[];
  @Output() close_modale = new EventEmitter<any>();

  private unsuscribe: Subscription[] = [];
  public editUserForm: FormGroup;

  constructor(private _formBuilder: FormBuilder, 
    private userService: UserService,
    private _notify: NotifyService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    // console.log("ROLESSS", this.roles);
    // console.log("USERRR", this.user)
    this.editUserForm = this._formBuilder.group({
      id: [this.user.id],
      name: [this.user.name],
      last_name: [this.user.last_name],
      email: [this.user.email],
      phone: [this.user.phone],
      number_identification: [this.user.number_identification]
    });
  }

  updateUser() {
    const updateUserSubcr = this.userService.updateUser(this.editUserForm.getRawValue())
      .subscribe((res) => {
        this._notify.show('El usuario ha sido actualizado exitosamente.', '', 'success');
        this.close_modale.emit(true);
      }, err => { throw err });
    this.unsuscribe.push(updateUserSubcr);
  }

  ngOnDestroy(){
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }

}
