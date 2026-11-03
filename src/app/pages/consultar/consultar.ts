import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Pqrs, PqrsSeguimiento } from '../../models/pqrs.model';
import { AuthService } from '../../services/auth.service';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-consultar',
  imports: [FormsModule],
  templateUrl: './consultar.html',
  styleUrl: './consultar.scss',
})
export class Consultar implements OnInit {
  private pqrsService = inject(PqrsService);
  protected auth = inject(AuthService);

  codigo = '';
  buscando = signal(false);
  error = signal<string | null>(null);
  resultado = signal<PqrsSeguimiento | null>(null);

  // PQRS del propio usuario (si está logueado): se listan sin exigir el código.
  mias = signal<Pqrs[]>([]);
  cargandoMias = signal(false);

  // Si hay sesión, carga de una las PQRS del usuario.
  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.cargarMias();
    }
  }

  // Trae las PQRS que el propio usuario ha radicado (incluye sus anónimas).
  cargarMias() {
    this.cargandoMias.set(true);
    this.pqrsService.mias().subscribe({
      next: (data) => {
        this.mias.set(data);
        this.cargandoMias.set(false);
      },
      error: () => this.cargandoMias.set(false),
    });
  }

  // Busca una PQRS por su código de seguimiento y muestra el resultado.
  consultar() {
    const codigo = this.codigo.trim();
    if (!codigo) return;

    this.error.set(null);
    this.resultado.set(null);
    this.buscando.set(true);

    this.pqrsService.seguimiento(codigo).subscribe({
      next: (data) => {
        this.buscando.set(false);
        this.resultado.set(data);
      },
      error: (err) => {
        this.buscando.set(false);
        this.error.set(err?.error?.detail ?? 'No se encontró una PQRS con ese código');
      },
    });
  }
}
