import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Adjunto } from '../../models/comunicacion.model';
import { PqrsCreate, TIPOS } from '../../models/pqrs.model';
import { AuthService } from '../../services/auth.service';
import { PqrsService } from '../../services/pqrs.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-radicar',
  imports: [FormsModule],
  templateUrl: './radicar.html',
  styleUrl: './radicar.scss',
})
export class Radicar {
  private pqrsService = inject(PqrsService);
  private uploads = inject(UploadService);
  private auth = inject(AuthService);

  readonly tipos = TIPOS;

  // Si el usuario está logueado, sus datos se toman de la cuenta (no se piden).
  logueado(): boolean {
    return this.auth.isLoggedIn();
  }

  // Modelo del formulario
  tipo = '';
  asunto = '';
  descripcion = '';
  esAnonima = false;
  nombreContacto = '';
  emailContacto = '';
  telefonoContacto = '';
  archivo = signal<File | null>(null);

  enviando = signal(false);
  subiendo = signal(false);
  error = signal<string | null>(null);
  codigoGenerado = signal<string | null>(null);

  seleccionarArchivo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.archivo.set(input.files?.[0] ?? null);
    input.value = '';
  }

  quitarArchivo() {
    this.archivo.set(null);
  }

  radicar() {
    this.error.set(null);
    this.enviando.set(true);

    const file = this.archivo();
    if (file) {
      this.subiendo.set(true);
      this.uploads.subir(file).subscribe({
        next: (adj) => {
          this.subiendo.set(false);
          this.enviarPqrs(adj);
        },
        error: (err) => {
          this.subiendo.set(false);
          this.enviando.set(false);
          this.error.set(err?.error?.detail ?? 'No se pudo subir el archivo');
        },
      });
    } else {
      this.enviarPqrs(null);
    }
  }

  private enviarPqrs(adj: Adjunto | null) {
    const data: PqrsCreate = {
      tipo: this.tipo,
      asunto: this.asunto,
      descripcion: this.descripcion,
      es_anonima: this.esAnonima,
      nombre_contacto: this.nombreContacto || null,
      email_contacto: this.emailContacto || null,
      telefono_contacto: this.telefonoContacto || null,
      adjunto_url: adj?.url ?? null,
      adjunto_tipo: adj?.tipo ?? null,
      adjunto_nombre: adj?.nombre ?? null,
    };

    this.pqrsService.radicar(data).subscribe({
      next: (pqrs) => {
        this.enviando.set(false);
        this.codigoGenerado.set(pqrs.codigo_seguimiento);
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err?.error?.detail ?? 'No se pudo radicar la PQRS');
      },
    });
  }

  nuevaPqrs() {
    // Limpia el formulario para radicar otra
    this.tipo = '';
    this.asunto = '';
    this.descripcion = '';
    this.esAnonima = false;
    this.nombreContacto = '';
    this.emailContacto = '';
    this.telefonoContacto = '';
    this.archivo.set(null);
    this.codigoGenerado.set(null);
    this.error.set(null);
  }
}
