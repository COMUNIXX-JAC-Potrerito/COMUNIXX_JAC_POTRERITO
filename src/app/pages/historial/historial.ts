import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { COMITES, ESTADOS, Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-historial',
  imports: [FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
})
export class Historial implements OnInit {
  private pqrsService = inject(PqrsService);

  readonly comites = COMITES;
  readonly estados = ESTADOS;

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Buscador por nombre, correo, asunto o código.
  busqueda = signal('');
  filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) {
      return this.pqrs();
    }
    return this.pqrs().filter(
      (p) =>
        (p.asunto ?? '').toLowerCase().includes(q) ||
        (p.descripcion ?? '').toLowerCase().includes(q) ||
        (p.nombre_contacto ?? '').toLowerCase().includes(q) ||
        (p.email_contacto ?? '').toLowerCase().includes(q) ||
        (p.codigo_seguimiento ?? '').toLowerCase().includes(q),
    );
  });

  // Selección temporal por fila (para reasignar comité o cambiar estado).
  comiteSel: Record<number, string> = {};
  estadoSel: Record<number, string> = {};

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

  asignar(p: Pqrs) {
    const comite = this.comiteSel[p.id];
    if (!comite) {
      return;
    }
    this.pqrsService.asignarComite(p.id, comite).subscribe({
      next: (r) => this.reemplazar(r),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo asignar el comité'),
    });
  }

  actualizarEstado(p: Pqrs) {
    const estado = this.estadoSel[p.id];
    if (!estado) {
      return;
    }
    this.pqrsService.cambiarEstado(p.id, estado).subscribe({
      next: (r) => this.reemplazar(r),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo cambiar el estado'),
    });
  }

  private reemplazar(actualizada: Pqrs) {
    this.pqrs.update((lista) => lista.map((x) => (x.id === actualizada.id ? actualizada : x)));
  }
}
