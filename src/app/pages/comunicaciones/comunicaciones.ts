import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Comunicacion } from '../../models/comunicacion.model';
import { ComunicacionService } from '../../services/comunicacion.service';
import { CapitalizarPipe, FechaLocalPipe } from '../../shared/pipes';

@Component({
  selector: 'app-comunicaciones',
  imports: [FormsModule, CapitalizarPipe, FechaLocalPipe],
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
  masivoPublico: 'todos' | 'jac' = 'todos';
  masivoGuardarBitacora = false;
  enviandoMasivo = signal(false);
  resultadoMasivo = signal<string | null>(null);
  errorMasivo = signal<string | null>(null);

  // Al abrir, carga la bitácora de comunicaciones.
  ngOnInit() {
    this.cargar();
  }

  // Trae las comunicaciones externas registradas.
  cargar() {
    this.service.listarComunicaciones().subscribe({
      next: (c) => this.items.set(c),
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo cargar la bitácora'),
    });
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
    if (!confirm(`¿Eliminar el registro "${c.asunto}" de la bitácora? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.service.eliminarComunicacion(c.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo eliminar'),
    });
  }

  // Envía el comunicado por correo al público elegido y muestra el resultado.
  enviarMasivo() {
    const destino =
      this.masivoPublico === 'jac'
        ? 'los miembros de la JAC (dignatarios)'
        : 'toda la comunidad registrada';
    if (!confirm(`El comunicado se enviará por correo a ${destino}. ¿Enviarlo?`)) {
      return;
    }
    this.enviandoMasivo.set(true);
    this.resultadoMasivo.set(null);
    this.errorMasivo.set(null);
    this.service
      .enviarMasivo(this.masivoAsunto, this.masivoContenido, this.masivoPublico, this.masivoGuardarBitacora)
      .subscribe({
        next: (r) => {
          this.enviandoMasivo.set(false);
          const nota = r.modo === 'simulado' ? ' (modo simulado: sin correo configurado)' : '';
          const bitacora = r.guardado_en_bitacora ? ' Guardado en la bitácora.' : '';
          this.resultadoMasivo.set(`Enviado a ${r.destinatarios} destinatarios${nota}.${bitacora}`);
          this.masivoAsunto = '';
          this.masivoContenido = '';
          this.masivoGuardarBitacora = false;
          if (r.guardado_en_bitacora) {
            this.cargar(); // refresca la bitácora con el nuevo registro
          }
        },
        error: (e) => {
          this.enviandoMasivo.set(false);
          this.errorMasivo.set(e?.error?.detail ?? 'No se pudo enviar el comunicado');
        },
      });
  }
}
