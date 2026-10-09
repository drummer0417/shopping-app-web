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

  // Observable die de huidige status en UID van de gebruiker bijhoudt
  user$ = user(this.auth);

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass)
      .then((result) => {
        this.isLoggedIn.set(true);
        this.router.navigate(['home']);
      })
      .catch((error) => {
        console.log('in catch error');
        console.log(error);
      })
      .finally(() => {
        // console.log('Klaar');
      });
  }

  logout() {
    return signOut(this.auth);
  }
}
