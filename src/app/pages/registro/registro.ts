import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RegistroData } from '../../models/pqrs.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private auth = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  phone = '';

  enviando = signal(false);
  error = signal<string | null>(null);
  exito = signal(false);

  registrar() {
    this.error.set(null);
    this.enviando.set(true);

    const data: RegistroData = {
      full_name: this.fullName,
      email: this.email,
      password: this.password,
      phone: this.phone,
    };

    this.auth.register(data).subscribe({
      next: () => {
        this.enviando.set(false);
        this.exito.set(true);
        // Redirige al login tras un momento
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err?.error?.detail ?? 'No se pudo completar el registro');
      },
    });
  }
}
