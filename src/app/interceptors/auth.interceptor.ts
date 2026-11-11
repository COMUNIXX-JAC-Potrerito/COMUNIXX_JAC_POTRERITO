import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

// Añade "Authorization: Bearer <token>" a cada petición si hay sesión.
// Si el backend responde 401 a una petición con token (sesión vencida o cuenta
// desactivada), cierra la sesión y lleva al login en vez de dejar la pantalla rota.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (token && error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { expirado: '1' } });
      }
      return throwError(() => error);
    }),
  );
};
