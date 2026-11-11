import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ESTADOS_GESTIONABLES, Pqrs, RespuestaPqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';
import { EstadoPipe, FechaLocalPipe, TipoPqrsPipe } from '../../shared/pipes';

type Estado = 'Nueva' | 'En_Proceso' | 'En_Espera' | 'Finalizada';
const VENTANA_EDICION_MS = 5 * 60 * 1000; // 5 minutos

@Component({
  selector: 'app-asignadas',
  imports: [FormsModule, EstadoPipe, FechaLocalPipe, TipoPqrsPipe],
  templateUrl: './asignadas.html',
  styleUrl: './asignadas.scss',
})
export class Asignadas implements OnInit {
  private pqrsService = inject(PqrsService);

  // Estados a los que se puede mover (sin "Nueva"); incluye "En_Espera".
  readonly estados = ESTADOS_GESTIONABLES;

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  ok = signal<string | null>(null);

  tab = signal<Estado>('Nueva');
  busqueda = signal('');

  // PQRS abierta (detalle tipo correo)
  seleccionada = signal<Pqrs | null>(null);
  respuestaTexto = ''; // texto de una NUEVA respuesta
  estadoSel = '';
  editandoId = signal<number | null>(null); // id de la respuesta que se está editando
  edicionTexto = ''; // texto mientras se edita una respuesta

  // PQRS del sub-panel activo (por estado) que además coinciden con la búsqueda.
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

  // Cuántas PQRS hay en cada estado (para los contadores de las pestañas).
  cuenta(estado: Estado): number {
    return this.pqrs().filter((p) => p.estado === estado).length;
  }

  // Al abrir, carga las PQRS asignadas a mi comisión.
  ngOnInit() {
    this.cargar();
  }

  // Trae las PQRS de la comisión del dignatario.
  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.pqrsService.asignadas().subscribe({
      next: (data) => {
        this.pqrs.set(data);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.detail ?? 'No se pudieron cargar las PQRS asignadas');
        this.cargando.set(false);
      },
    });
  }

  // Abre una PQRS en vista de detalle para responderla/gestionarla.
  abrir(p: Pqrs) {
    this.seleccionada.set(p);
    this.respuestaTexto = '';
    this.estadoSel = '';
    this.editandoId.set(null);
    this.error.set(null);
    this.ok.set(null);
  }

  // Vuelve a la lista.
  volver() {
    this.seleccionada.set(null);
  }

  // ¿Esta respuesta aún se puede editar? (dentro de los 5 min de creada).
  puedeEditar(r: RespuestaPqrs): boolean {
    if (!r.created_at || r.id === 0) {
      return false; // id 0 = respuesta legada (antigua), no editable
    }
    const iso =
      r.created_at.endsWith('Z') || r.created_at.includes('+')
        ? r.created_at
        : r.created_at + 'Z';
    return Date.now() - new Date(iso).getTime() < VENTANA_EDICION_MS;
  }

  // Abre el cuadro para editar una respuesta del hilo.
  editar(r: RespuestaPqrs) {
    this.editandoId.set(r.id);
    this.edicionTexto = r.texto;
  }

  // Cancela la edición de una respuesta.
  cancelarEdicion() {
    this.editandoId.set(null);
    this.edicionTexto = '';
  }

  // Guarda los cambios de una respuesta editada.
  guardarEdicion(r: RespuestaPqrs) {
    const texto = this.edicionTexto.trim();
    if (!texto) {
      return;
    }
    this.error.set(null);
    this.pqrsService.editarRespuesta(r.id, texto).subscribe({
      next: (actualizada) => {
        this.reemplazar(actualizada);
        this.seleccionada.set(actualizada);
        this.cancelarEdicion();
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo editar la respuesta'),
    });
  }

  // Envía una NUEVA respuesta a la PQRS abierta (se pueden enviar varias).
  responder() {
    const p = this.seleccionada();
    if (!p) {
      return;
    }
    const texto = this.respuestaTexto.trim();
    if (!texto) {
      return;
    }
    this.error.set(null);
    this.ok.set(null);
    this.pqrsService.responder(p.id, texto).subscribe({
      next: (r) => {
        this.reemplazar(r);
        this.seleccionada.set(r);
        this.respuestaTexto = '';
        this.ok.set('Respuesta enviada. El ciudadano ya puede verla con su código.');
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo enviar la respuesta'),
    });
  }

  // Cambia el estado de la PQRS abierta (puede moverla de pestaña).
  actualizarEstado() {
    const p = this.seleccionada();
    if (!p || !this.estadoSel) {
      return;
    }
    this.pqrsService.cambiarEstado(p.id, this.estadoSel).subscribe({
      next: (r) => {
        this.reemplazar(r);
        this.seleccionada.set(r);
        this.estadoSel = '';
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo cambiar el estado'),
    });
  }

  // Reemplaza la PQRS en la lista por su versión actualizada.
  private reemplazar(actualizada: Pqrs) {
    this.pqrs.update((lista) => lista.map((x) => (x.id === actualizada.id ? actualizada : x)));
  }
}
