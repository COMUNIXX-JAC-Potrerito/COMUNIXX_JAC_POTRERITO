import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal<string | null>(null);
  cargando = signal(false);

  entrar() {
    this.error.set(null);
    this.cargando.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.cargando.set(false);
        // Dignatarios -> Panel JAC; comunidad -> portal público.
        if (this.auth.esDignatario()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err?.error?.detail ?? 'No se pudo iniciar sesión');
      },
    });
  }
}
