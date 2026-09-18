import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

// Cierra la sesión tras este tiempo sin actividad (por seguridad).
const IDLE_MS = 15 * 60 * 1000; // 15 minutos

@Injectable({ providedIn: 'root' })
export class IdleService {
  private auth = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private iniciado = false;

  iniciar() {
    if (this.iniciado || typeof window === 'undefined') {
      return;
    }
    this.iniciado = true;

    const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    // Fuera de Angular para no disparar detección de cambios en cada evento.
    this.zone.runOutsideAngular(() => {
      eventos.forEach((ev) =>
        window.addEventListener(ev, () => this.reiniciar(), { passive: true }),
      );
    });
    this.reiniciar();
  }

  private reiniciar() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.expirar(), IDLE_MS);
  }

  private expirar() {
    // Si no hay sesión, no hay nada que cerrar; solo reprograma el chequeo.
    if (!this.auth.getToken()) {
      this.reiniciar();
      return;
    }
    this.zone.run(() => {
      this.auth.logout();
      this.router.navigate(['/login'], { queryParams: { expirado: '1' } });
    });
  }
}
