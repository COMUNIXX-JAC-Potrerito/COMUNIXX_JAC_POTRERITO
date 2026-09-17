import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CATEGORIAS, Publicacion, etiquetaCategoria } from '../../models/publicacion.model';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-admin-publicaciones',
  imports: [FormsModule],
  templateUrl: './admin-publicaciones.html',
  styleUrl: './admin-publicaciones.scss',
})
export class AdminPublicaciones implements OnInit {
  private service = inject(PublicacionesService);

  readonly categorias = CATEGORIAS;
  readonly etiqueta = etiquetaCategoria;

  items = signal<Publicacion[]>([]);
  error = signal<string | null>(null);
  guardando = signal(false);

  // Formulario
  categoria = '';
  titulo = '';
  contenido = '';
  fechaEvento = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe({
      next: (data) => this.items.set(data),
      error: (err) => this.error.set(err?.error?.detail ?? 'Error al cargar'),
    });
  }

  publicar() {
    this.error.set(null);
    this.guardando.set(true);
    this.service
      .crear({
        categoria: this.categoria,
        titulo: this.titulo,
        contenido: this.contenido,
        fecha_evento: this.fechaEvento || null,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.categoria = '';
          this.titulo = '';
          this.contenido = '';
          this.fechaEvento = '';
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(err?.error?.detail ?? 'No se pudo publicar');
        },
      });
  }

  eliminar(p: Publicacion) {
    this.service.eliminar(p.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo eliminar'),
    });
  }
}
