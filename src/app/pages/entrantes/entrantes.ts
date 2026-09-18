import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { COMITES, ESTADOS, Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-entrantes',
  imports: [FormsModule],
  templateUrl: './entrantes.html',
  styleUrl: './entrantes.scss',
})
export class Entrantes implements OnInit {
  private pqrsService = inject(PqrsService);

  readonly comites = COMITES;
  readonly estados = ESTADOS;

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Selección temporal por fila (id de PQRS -> valor elegido en el <select>)
  comiteSel: Record<number, string> = {};
  estadoSel: Record<number, string> = {};

  // Qué PQRS están expandidas (para ver el contenido completo)
  expandido: Record<number, boolean> = {};

  toggle(id: number) {
    this.expandido[id] = !this.expandido[id];
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.pqrsService.entrantes().subscribe({
      next: (data) => {
        this.pqrs.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'No se pudieron cargar las PQRS entrantes');
        this.cargando.set(false);
      },
    });
  }

  asignar(p: Pqrs) {
    const comite = this.comiteSel[p.id];
    if (!comite) return;

    this.pqrsService.asignarComite(p.id, comite).subscribe({
      // al asignar pasa a "En_Proceso": sale de la bandeja de entrantes
      next: () => this.pqrs.update((l) => l.filter((x) => x.id !== p.id)),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo asignar el comité'),
    });
  }

  actualizarEstado(p: Pqrs) {
    const estado = this.estadoSel[p.id];
    if (!estado) return;

    this.pqrsService.cambiarEstado(p.id, estado).subscribe({
      // cualquier cambio de estado la saca de "entrantes" (que solo muestra Nueva)
      next: () => this.pqrs.update((l) => l.filter((x) => x.id !== p.id)),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo cambiar el estado'),
    });
  }
}
