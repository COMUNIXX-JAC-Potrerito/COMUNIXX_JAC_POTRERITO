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
  busqueda = signal('');

  seleccionada = signal<Pqrs | null>(null);
  comiteSel = '';
  estadoSel = '';

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

  abrir(p: Pqrs) {
    this.seleccionada.set(p);
    this.comiteSel = '';
    this.estadoSel = '';
    this.error.set(null);
  }

  volver() {
    this.seleccionada.set(null);
  }

  asignar() {
    const p = this.seleccionada();
    if (!p || !this.comiteSel) {
      return;
    }
    this.pqrsService.asignarComite(p.id, this.comiteSel).subscribe({
      next: (r) => {
        this.reemplazar(r);
        this.seleccionada.set(r);
        this.comiteSel = '';
      },
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo asignar el comité'),
    });
  }

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
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo cambiar el estado'),
    });
  }

  private reemplazar(actualizada: Pqrs) {
    this.pqrs.update((lista) => lista.map((x) => (x.id === actualizada.id ? actualizada : x)));
  }
}
