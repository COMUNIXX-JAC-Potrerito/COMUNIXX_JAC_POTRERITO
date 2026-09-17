import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ESTADOS, Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-asignadas',
  imports: [FormsModule],
  templateUrl: './asignadas.html',
  styleUrl: './asignadas.scss',
})
export class Asignadas implements OnInit {
  private pqrsService = inject(PqrsService);

  readonly estados = ESTADOS;

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  ok = signal<string | null>(null);

  respuestaSel: Record<number, string> = {};
  estadoSel: Record<number, string> = {};

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.pqrsService.asignadas().subscribe({
      next: (data) => {
        this.pqrs.set(data);
        data.forEach((p) => (this.respuestaSel[p.id] = p.respuesta ?? ''));
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.detail ?? 'No se pudieron cargar las PQRS asignadas');
        this.cargando.set(false);
      },
    });
  }

  responder(p: Pqrs) {
    const texto = (this.respuestaSel[p.id] ?? '').trim();
    if (!texto) {
      return;
    }
    this.error.set(null);
    this.ok.set(null);
    this.pqrsService.responder(p.id, texto).subscribe({
      next: () => {
        this.ok.set('Respuesta guardada. El ciudadano ya puede verla con su código de seguimiento.');
        this.cargar();
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo guardar la respuesta'),
    });
  }

  actualizarEstado(p: Pqrs) {
    const estado = this.estadoSel[p.id];
    if (!estado) {
      return;
    }
    this.pqrsService.cambiarEstado(p.id, estado).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo cambiar el estado'),
    });
  }
}
