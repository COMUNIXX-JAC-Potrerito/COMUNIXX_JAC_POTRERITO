import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ESTADOS, Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

type Estado = 'Nueva' | 'En_Proceso' | 'Finalizada';
const VENTANA_EDICION_MS = 5 * 60 * 1000; // 5 minutos

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

  // Sub-panel activo por estado.
  tab = signal<Estado>('Nueva');
  busqueda = signal('');

  respuestaSel: Record<number, string> = {};
  estadoSel: Record<number, string> = {};
  editando: Record<number, boolean> = {};

  // PQRS del sub-panel activo, aplicando también el buscador.
  visibles = computed(() => {
    const t = this.tab();
    const q = this.busqueda().trim().toLowerCase();
    return this.pqrs()
      .filter((p) => p.estado === t)
      .filter(
        (p) =>
          !q ||
          (p.asunto ?? '').toLowerCase().includes(q) ||
          (p.descripcion ?? '').toLowerCase().includes(q) ||
          (p.nombre_contacto ?? '').toLowerCase().includes(q) ||
          (p.email_contacto ?? '').toLowerCase().includes(q) ||
          (p.codigo_seguimiento ?? '').toLowerCase().includes(q),
      );
  });

  cuenta(estado: Estado): number {
    return this.pqrs().filter((p) => p.estado === estado).length;
  }

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

  // ¿Todavía se puede editar la respuesta (dentro de los 5 min)?
  puedeEditar(p: Pqrs): boolean {
    if (!p.respuesta_fecha) {
      return false;
    }
    const iso =
      p.respuesta_fecha.endsWith('Z') || p.respuesta_fecha.includes('+')
        ? p.respuesta_fecha
        : p.respuesta_fecha + 'Z';
    return Date.now() - new Date(iso).getTime() < VENTANA_EDICION_MS;
  }

  editar(p: Pqrs) {
    this.respuestaSel[p.id] = p.respuesta ?? '';
    this.editando[p.id] = true;
  }

  cancelar(p: Pqrs) {
    this.respuestaSel[p.id] = p.respuesta ?? '';
    this.editando[p.id] = false;
  }

  responder(p: Pqrs) {
    const texto = (this.respuestaSel[p.id] ?? '').trim();
    if (!texto) {
      return;
    }
    this.error.set(null);
    this.ok.set(null);
    this.pqrsService.responder(p.id, texto).subscribe({
      next: (r) => {
        this.reemplazar(r);
        this.editando[p.id] = false;
        this.ok.set('Respuesta guardada. El ciudadano ya puede verla con su código.');
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
      next: (r) => {
        this.reemplazar(r);
        this.estadoSel[p.id] = '';
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo cambiar el estado'),
    });
  }

  private reemplazar(actualizada: Pqrs) {
    this.respuestaSel[actualizada.id] = actualizada.respuesta ?? '';
    this.pqrs.update((lista) => lista.map((x) => (x.id === actualizada.id ? actualizada : x)));
  }
}
