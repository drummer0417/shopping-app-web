import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  authService = inject(AuthService);

  form = new FormGroup({
    userid: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onLogin() {
    if (this.form.controls.userid.value && this.form.controls.password.value) {
      this.authService.login(this.form.controls.userid.value, this.form.controls.password.value);
    }
  }
}
