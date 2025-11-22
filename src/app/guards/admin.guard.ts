import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // se nem token tem, manda pro login
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return auth.user$.pipe(
    take(1),
    switchMap(user => {
      // se já temos o usuário na memória, usa ele
      if (user) return of(user);
      // se ainda não carregou, chama loadMe
      return auth.loadMe();
    }),
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      }

      // não é admin → manda pra home (ou pra /, /bazar, onde você preferir)
      router.navigate(['/']);
      return false;
    })
  );
};
