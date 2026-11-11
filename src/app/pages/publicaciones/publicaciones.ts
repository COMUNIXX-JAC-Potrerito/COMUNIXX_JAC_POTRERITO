import { Component, OnInit, inject, signal } from '@angular/core';

import { CATEGORIAS, Publicacion, etiquetaCategoria } from '../../models/publicacion.model';
import { PublicacionesService } from '../../services/publicaciones.service';
import { FechaDiaPipe, FechaLocalPipe } from '../../shared/pipes';

@Component({
  selector: 'app-publicaciones',
  imports: [FechaDiaPipe, FechaLocalPipe],
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

  // Imagen ampliada (lightbox); null = cerrado.
  imagenAmpliada = signal<string | null>(null);

  // Abre una imagen en grande (lightbox).
  ampliar(url: string) {
    this.imagenAmpliada.set(url);
  }

  // Cierra la imagen ampliada.
  cerrarImagen() {
    this.imagenAmpliada.set(null);
  }

  // Al abrir, carga las publicaciones.
  ngOnInit() {
    this.cargar();
  }

  // Trae las publicaciones aplicando el filtro de categoría.
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

  // Cambia el filtro de categoría y recarga.
  setFiltro(valor: string) {
    this.filtro.set(valor);
    this.cargar();
  }
}
