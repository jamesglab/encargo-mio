import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UsersService } from '../../_services/users.service';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  public userForm: FormGroup = null;
  public errorsPassword = {
    "capital_letter": true,
    "special_character": true,
    "number": true,
    "min_length": true
  };
  public showPassword: boolean = false;
  public submitted: boolean = false;
  public isLoading: boolean = false;

  @Output() close_modale: EventEmitter<boolean> = new EventEmitter<boolean>();
  public unsuscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, 
    private readonly usersService: UsersService,
    private readonly notify: NotifyService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.userForm = this.fb.group({
      name: [null, [Validators.required]],
      last_name: [null, [Validators.required]],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])(?=.*[#?!@$%^&*-])[A-Za-z\d$@$!%*?&].{7,}/)
      ])]
    })
  }

  get form() { return this.userForm.controls; }

  validateName(e) {
    if (e.key.match(/[a-zñçáéíóú.&/@\s\-\.\°]/i) === null) {
      e.preventDefault();
    }
  }

  validatePassword() {
    const newPassword = this.userForm.controls.password.value;
    var oneCapitalLetter = /[A-Z]/;
    var oneNumber = /[0-9]/;
    var regularExpression = /[#?!@$%^&*-]/;
    oneCapitalLetter.test(newPassword) ? this.errorsPassword.capital_letter = false : this.errorsPassword.capital_letter = true;
    oneNumber.test(newPassword) ? this.errorsPassword.number = false : this.errorsPassword.number = true;
    (newPassword.length > 7) ? this.errorsPassword.min_length = false : this.errorsPassword.min_length = true;
    regularExpression.test(newPassword) ? this.errorsPassword.special_character = false : this.errorsPassword.special_character = true;
  }

  onSubmit(): void {
    this.submitted = true;

    if(this.userForm.invalid){
      return;
    }

    this.isLoading = true;

    const addUserSubscr = this.usersService.addUser(this.userForm.getRawValue())
      .subscribe((res) => {
        this.submitted = false;
        this.isLoading = false;
        this.notify.show('El usuario ha sido registrado exitosamente.', '', 'success');
        this.close_modale.emit(true);
      }, (err) => {
        this.submitted = false;
        this.isLoading = false;
        throw err;
      })
      this.unsuscribe.push(addUserSubscr);
  }

  ngOnDestroy() {
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }

}
