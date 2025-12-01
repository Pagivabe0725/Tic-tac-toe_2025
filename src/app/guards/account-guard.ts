import {CanMatchFn, RedirectCommand, Router } from '@angular/router';
import { Auth } from '../services/auth.service';
import { inject } from '@angular/core';

export const accountGuard: CanMatchFn = async (route, state) => {
  const auth: Auth = inject(Auth);
  const router = inject(Router);

  await auth.setCurrentUserIfExist();
  if (auth.user()) {
    return true;
  }
  return new RedirectCommand(router.parseUrl('/not-found'));
};
