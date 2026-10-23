import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);

  form = new FormGroup({
    userid: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onLogin() {
    if (this.form.controls.userid.value && this.form.controls.password.value) {
      this.authService
        .login(this.form.controls.userid.value, this.form.controls.password.value)
        .catch((error) => {
          console.log(error);
          this.snackBar.open('Er is een fout opgetreden. Controleer je email en wachtwoord', 'Sluiten', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
            
          });
        });
    }
  }
}
