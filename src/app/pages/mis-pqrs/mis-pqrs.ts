import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-mis-pqrs',
  imports: [FormsModule],
  templateUrl: './mis-pqrs.html',
  styleUrl: './mis-pqrs.scss',
})
export class MisPqrs implements OnInit {
  private pqrsService = inject(PqrsService);

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  busqueda = signal('');

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

  ngOnInit() {
    this.cargar();
  }

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
