import { Component, OnInit, inject, signal } from '@angular/core';

import { Reporte } from '../../models/comunicacion.model';
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
  cargando = signal(false);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.reporte().subscribe({
      next: (r) => {
        this.data.set(r);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
