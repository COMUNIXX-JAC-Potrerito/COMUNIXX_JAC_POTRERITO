import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { CATEGORIAS, Publicacion, etiquetaCategoria } from '../../models/publicacion.model';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-publicaciones',
  imports: [DatePipe],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
})
export class Publicaciones implements OnInit {
  private service = inject(PublicacionesService);

  readonly categorias = CATEGORIAS;
  readonly etiqueta = etiquetaCategoria;

  filtro = signal<string>('');
  items = signal<Publicacion[]>([]);
  cargando = signal(false);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listar(this.filtro() || undefined).subscribe({
      next: (data) => {
        this.items.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  setFiltro(valor: string) {
    this.filtro.set(valor);
    this.cargar();
  }
}
