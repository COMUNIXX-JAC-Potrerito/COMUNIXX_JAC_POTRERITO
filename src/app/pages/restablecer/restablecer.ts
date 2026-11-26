import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restablecer',
  imports: [FormsModule, RouterLink],
  templateUrl: './restablecer.html',
  styleUrl: './restablecer.scss',
})
export class Restablecer {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Token del enlace del correo (?token=...). Vacío = enlace inválido.
  token = this.route.snapshot.queryParamMap.get('token') ?? '';
  password = '';
  confirmar = '';
  cargando = signal(false);
  listo = signal(false);
  error = signal<string | null>(null);

  // Misma regla que el backend (que igual la verifica): 8+, una mayúscula, un número.
  get passwordValida(): boolean {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(this.password);
  }

  get coincide(): boolean {
    return this.password === this.confirmar;
  }

  restablecer() {
    this.error.set(null);
    if (!this.passwordValida) {
      this.error.set('La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.');
      return;
    }
    if (!this.coincide) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);
    this.auth.restablecerPassword(this.token, this.password).subscribe({
      next: () => {
        this.cargando.set(false);
        this.listo.set(true);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(
          err?.error?.detail ?? 'No se pudo cambiar la contraseña. El enlace pudo vencer.',
        );
      },
    });
  }
}
