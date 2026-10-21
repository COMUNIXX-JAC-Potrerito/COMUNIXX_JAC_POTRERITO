import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Comunicacion } from '../../models/comunicacion.model';
import { ComunicacionService } from '../../services/comunicacion.service';

@Component({
  selector: 'app-comunicaciones',
  imports: [FormsModule, DatePipe],
  templateUrl: './comunicaciones.html',
  styleUrl: './comunicaciones.scss',
})
export class Comunicaciones implements OnInit {
  private service = inject(ComunicacionService);

  items = signal<Comunicacion[]>([]);
  error = signal<string | null>(null);

  // Registro de comunicación externa
  tipo = 'enviada';
  entidad = '';
  asunto = '';
  descripcion = '';

  // Envío masivo
  masivoAsunto = '';
  masivoContenido = '';
  enviandoMasivo = signal(false);
  resultadoMasivo = signal<string | null>(null);

  // Al abrir, carga la bitácora de comunicaciones.
  ngOnInit() {
    this.cargar();
  }

  // Trae las comunicaciones externas registradas.
  cargar() {
    this.service.listarComunicaciones().subscribe((c) => this.items.set(c));
  }

  // Registra una nueva comunicación externa y limpia el formulario.
  registrar() {
    this.error.set(null);
    this.service
      .registrarComunicacion({ tipo: this.tipo, entidad: this.entidad, asunto: this.asunto, descripcion: this.descripcion || null })
      .subscribe({
        next: () => {
          this.entidad = '';
          this.asunto = '';
          this.descripcion = '';
          this.cargar();
        },
        error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo registrar'),
      });
  }

  // Elimina una comunicación de la bitácora.
  eliminar(c: Comunicacion) {
    this.service.eliminarComunicacion(c.id).subscribe(() => this.cargar());
  }

  // Envía el comunicado por correo a toda la comunidad y muestra el resultado.
  enviarMasivo() {
    this.enviandoMasivo.set(true);
    this.resultadoMasivo.set(null);
    this.service.enviarMasivo(this.masivoAsunto, this.masivoContenido).subscribe({
      next: (r) => {
        this.enviandoMasivo.set(false);
        const nota = r.modo === 'simulado' ? ' (modo simulado: sin correo configurado)' : '';
        this.resultadoMasivo.set(`Enviado a ${r.destinatarios} destinatarios${nota}.`);
        this.masivoAsunto = '';
        this.masivoContenido = '';
      },
      error: (e) => {
        this.enviandoMasivo.set(false);
        this.resultadoMasivo.set(e?.error?.detail ?? 'No se pudo enviar');
      },
    });
  }
}
