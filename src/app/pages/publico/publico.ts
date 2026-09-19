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

  logueado(): boolean {
    return this.auth.isLoggedIn();
  }

  esDignatario(): boolean {
    return this.auth.esDignatario();
  }

  toggleMenu() {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  salir() {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
