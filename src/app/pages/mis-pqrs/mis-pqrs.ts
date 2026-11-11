import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';
import { EstadoPipe, TipoPqrsPipe } from '../../shared/pipes';

@Component({
  selector: 'app-mis-pqrs',
  imports: [FormsModule, EstadoPipe, TipoPqrsPipe],
  templateUrl: './mis-pqrs.html',
  styleUrl: './mis-pqrs.scss',
})
export class MisPqrs implements OnInit {
  private pqrsService = inject(PqrsService);

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  busqueda = signal('');
  seleccionada = signal<Pqrs | null>(null);

  // Abre una PQRS en vista de detalle.
  abrir(p: Pqrs) {
    this.seleccionada.set(p);
  }
  // Vuelve a la lista.
  volver() {
    this.seleccionada.set(null);
  }

  // Filtra las PQRS por código o asunto según la búsqueda.
  filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) {
      return this.pqrs();
    }
    return this.pqrs().filter(
      (p) =>
        (p.codigo_seguimiento ?? '').toLowerCase().includes(q) ||
        (p.asunto ?? '').toLowerCase().includes(q),
    );
  });

  // Al abrir, carga las PQRS del usuario.
  ngOnInit() {
    this.cargar();
  }

  // Trae las PQRS que radicó el propio usuario.
  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.pqrsService.mias().subscribe({
      next: (d) => {
        this.pqrs.set(d);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.detail ?? 'No se pudieron cargar tus PQRS');
        this.cargando.set(false);
      },
    });
  }
}
