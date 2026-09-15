import { Component, OnInit, inject, signal } from '@angular/core';

import { Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-historial',
  imports: [],
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
})
export class Historial implements OnInit {
  private pqrsService = inject(PqrsService);

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.pqrsService.historial().subscribe({
      next: (data) => {
        this.pqrs.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'No se pudo cargar el historial');
        this.cargando.set(false);
      },
    });
  }
}
