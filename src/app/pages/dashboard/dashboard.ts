import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private auth = inject(AuthService);
  private router = inject(Router);

  menuAbierto = signal(false);

  // ¿El usuario es superadmin? (para mostrar la opción "Usuarios").
  esSuperadmin(): boolean {
    return this.auth.esSuperadmin();
  }

  // Abre/cierra el menú hamburguesa (móvil).
  toggleMenu() {
    this.menuAbierto.update((v) => !v);
  }

  // Cierra el menú hamburguesa.
  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  // Cierra sesión y vuelve al login.
  salir() {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
