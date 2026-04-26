import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

function redirectToLogin(): UrlTree {
  return inject(Router).createUrlTree(['/login']);
}

export const adminGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  return authSession.isAdmin() ? true : redirectToLogin();
};

export const learnerGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  return authSession.isLearner() ? true : redirectToLogin();
};

export const guestOnlyGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  if (!authSession.isLoggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree([authSession.ensureRoleRedirect()]);
};
