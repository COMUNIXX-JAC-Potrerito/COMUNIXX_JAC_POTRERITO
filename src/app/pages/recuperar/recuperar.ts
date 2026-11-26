import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar',
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.scss',
})
export class Recuperar {
  private auth = inject(AuthService);

  email = '';
  cargando = signal(false);
  // Al enviar mostramos siempre el mismo mensaje (el backend no revela si el
  // correo existe), así que basta una bandera de "enviado".
  enviado = signal(false);
  error = signal<string | null>(null);

  enviar() {
    this.error.set(null);
    this.cargando.set(true);

    this.auth.recuperarPassword(this.email).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudo enviar el correo. Inténtalo de nuevo en un momento.');
      },
    });
  }
}
