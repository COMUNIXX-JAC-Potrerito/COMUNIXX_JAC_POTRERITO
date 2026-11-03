import { Component, OnInit, inject, signal } from '@angular/core';

import { CargaComite, Reporte } from '../../models/comunicacion.model';
import { ComunicacionService } from '../../services/comunicacion.service';

@Component({
  selector: 'app-reportes',
  imports: [],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private service = inject(ComunicacionService);

  data = signal<Reporte | null>(null);
  cargas = signal<CargaComite[]>([]);
  cargando = signal(false);

  // Al abrir la página, carga el resumen.
  ngOnInit() {
    this.cargar();
  }

  // Trae el resumen de conteos del sistema desde el backend.
  cargar() {
    this.cargando.set(true);
    this.service.reporte().subscribe({
      next: (r) => {
        this.data.set(r);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
    // Carga de cada comité (trabajo pendiente) para el panel general.
    this.service.cargaComites().subscribe({
      next: (c) => this.cargas.set(c),
      error: () => this.cargas.set([]),
    });
  }
}
