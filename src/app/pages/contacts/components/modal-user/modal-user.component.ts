import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-modal-user',
  templateUrl: './modal-user.component.html',
  styleUrls: ['./modal-user.component.scss']
})
export class ModalUserComponent implements OnInit {

  @Input() user: any;
  @Input() roles: any[];
  @Output() close_modale = new EventEmitter<any>()

  public editUserForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {

    
    this.buildForm();
  }

  buildForm() {
    this.editUserForm = this._formBuilder.group({
      name: [this.user.name],
      last_name: [this.user.last_name],
      email: [this.user.email],
      phone: [this.user.phone],
      number_identification: [this.user.number_identification],
      role: [this.user.role[0]],
    });
    console.log('user',this.editUserForm)
  }

  updateUser() {
    console.log('sendUser',this.editUserForm)

  }
}
