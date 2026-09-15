import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PqrsCreate, TIPOS } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-radicar',
  imports: [FormsModule],
  templateUrl: './radicar.html',
  styleUrl: './radicar.scss',
})
export class Radicar {
  private pqrsService = inject(PqrsService);

  readonly tipos = TIPOS;

  // Modelo del formulario
  tipo = '';
  asunto = '';
  descripcion = '';
  esAnonima = false;
  nombreContacto = '';
  emailContacto = '';
  telefonoContacto = '';

  enviando = signal(false);
  error = signal<string | null>(null);
  codigoGenerado = signal<string | null>(null);

  radicar() {
    this.error.set(null);
    this.enviando.set(true);

    const data: PqrsCreate = {
      tipo: this.tipo,
      asunto: this.asunto,
      descripcion: this.descripcion,
      es_anonima: this.esAnonima,
      nombre_contacto: this.nombreContacto || null,
      email_contacto: this.emailContacto || null,
      telefono_contacto: this.telefonoContacto || null,
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
    this.codigoGenerado.set(null);
    this.error.set(null);
  }
}
