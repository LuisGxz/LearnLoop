import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../models';

/** Requires a signed-in user; otherwise bounces to /login with a redirect. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

/** Requires a specific role; signed-in-wrong-role lands on the catalog. */
export function roleGuard(role: Role): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
    }
    return auth.user()?.role === role ? true : router.createUrlTree(['/']);
  };
}
