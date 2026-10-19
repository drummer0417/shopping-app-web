import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatIconModule, MatInputModule],
  selector: 'app-login',
  styleUrl: './login.scss',
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
