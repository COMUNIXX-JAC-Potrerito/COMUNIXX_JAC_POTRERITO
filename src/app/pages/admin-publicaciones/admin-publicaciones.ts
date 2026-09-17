import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Adjunto } from '../../models/comunicacion.model';
import { CATEGORIAS, Publicacion, etiquetaCategoria } from '../../models/publicacion.model';
import { PublicacionesService } from '../../services/publicaciones.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-admin-publicaciones',
  imports: [FormsModule],
  templateUrl: './admin-publicaciones.html',
  styleUrl: './admin-publicaciones.scss',
})
export class AdminPublicaciones implements OnInit {
  private service = inject(PublicacionesService);
  private uploads = inject(UploadService);

  readonly categorias = CATEGORIAS;
  readonly etiqueta = etiquetaCategoria;

  items = signal<Publicacion[]>([]);
  error = signal<string | null>(null);
  guardando = signal(false);
  subiendo = signal(false);

  // Formulario
  categoria = '';
  titulo = '';
  contenido = '';
  fechaEvento = '';
  archivo = signal<File | null>(null);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe({
      next: (data) => this.items.set(data),
      error: (err) => this.error.set(err?.error?.detail ?? 'Error al cargar'),
    });
  }

  seleccionarArchivo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.archivo.set(input.files?.[0] ?? null);
    input.value = '';
  }

  quitarArchivo() {
    this.archivo.set(null);
  }

  publicar() {
    this.error.set(null);
    this.guardando.set(true);

    const file = this.archivo();
    if (file) {
      this.subiendo.set(true);
      this.uploads.subir(file).subscribe({
        next: (adj) => {
          this.subiendo.set(false);
          this.enviar(adj);
        },
        error: (err) => {
          this.subiendo.set(false);
          this.guardando.set(false);
          this.error.set(err?.error?.detail ?? 'No se pudo subir el archivo');
        },
      });
    } else {
      this.enviar(null);
    }
  }

  private enviar(adj: Adjunto | null) {
    this.service
      .crear({
        categoria: this.categoria,
        titulo: this.titulo,
        contenido: this.contenido,
        fecha_evento: this.fechaEvento || null,
        adjunto_url: adj?.url ?? null,
        adjunto_tipo: adj?.tipo ?? null,
        adjunto_nombre: adj?.nombre ?? null,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.categoria = '';
          this.titulo = '';
          this.contenido = '';
          this.fechaEvento = '';
          this.archivo.set(null);
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
