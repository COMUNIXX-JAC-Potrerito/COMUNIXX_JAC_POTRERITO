import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

// Protege el Panel JAC: exige sesión iniciada Y rol de dignatario.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  // Sesión de comunidad (no dignatario): no entra al panel, va al portal.
  if (!auth.esDignatario()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
