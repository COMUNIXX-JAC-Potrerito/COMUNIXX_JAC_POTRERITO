import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PqrsSeguimiento } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-consultar',
  imports: [FormsModule],
  templateUrl: './consultar.html',
  styleUrl: './consultar.scss',
})
export class Consultar {
  private pqrsService = inject(PqrsService);

  codigo = '';
  buscando = signal(false);
  error = signal<string | null>(null);
  resultado = signal<PqrsSeguimiento | null>(null);

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
