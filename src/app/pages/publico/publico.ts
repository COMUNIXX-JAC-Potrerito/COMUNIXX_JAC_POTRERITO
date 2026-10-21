import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-publico',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './publico.html',
  styleUrl: './publico.scss',
})
export class Publico {
  private auth = inject(AuthService);
  private router = inject(Router);

  menuAbierto = signal(false);

  // ¿Hay sesión iniciada? (para mostrar "Cerrar sesión" en el header).
  logueado(): boolean {
    return this.auth.isLoggedIn();
  }

  // ¿El usuario es dignatario? (para mostrar el enlace al Panel JAC).
  esDignatario(): boolean {
    return this.auth.esDignatario();
  }

  // Abre/cierra el menú hamburguesa (móvil).
  toggleMenu() {
    this.menuAbierto.update((v) => !v);
  }

  // Cierra el menú hamburguesa.
  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  // Cierra sesión y vuelve al portal.
  salir() {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
