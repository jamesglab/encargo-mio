import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifyService } from 'src/app/_services/notify.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public submitted: boolean = false;
  public isLoading: boolean = false;
  public error = '';
  public returnUrl: string;
  public year: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _authService: AuthService,
    private _notify: NotifyService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {

    this.submitted = true;

    if (this.loginForm.invalid) {
      this._notify.show("Atención", "No has llenado los datos de inicio de sesión corectamente", "warning");
      return;
    }

    this.isLoading = true;
    this._authService.login(this.loginForm.getRawValue()).subscribe((res: any) => {
      this.router.navigate(['/']);
      this.isLoading = false;
    }, err => {
      this._notify.show("Atención", "Hemos tenido un error al intentar loguearte.", "warning");
      this.isLoading = false;
      throw err;
    });

  }

}
