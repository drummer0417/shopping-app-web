// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Auth, authState, user } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const auth = inject(Auth);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
  );
};
