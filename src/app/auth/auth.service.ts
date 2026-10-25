import { Injectable, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  public isLoggedIn = signal(false);
  user$ = user(this.auth);

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        this.isLoggedIn.set(true);
        this.router.navigate(['home']);
      });
  }

  logoff() {
    this.auth
    return signOut(this.auth);
  }
}
