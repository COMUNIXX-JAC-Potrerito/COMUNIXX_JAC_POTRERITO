import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Mensaje, Usuario } from '../../models/comunicacion.model';
import { ComunicacionService } from '../../services/comunicacion.service';

@Component({
  selector: 'app-mensajes',
  imports: [FormsModule, DatePipe],
  templateUrl: './mensajes.html',
  styleUrl: './mensajes.scss',
})
export class Mensajes implements OnInit {
  private service = inject(ComunicacionService);

  tab = signal<'recibidos' | 'enviados'>('recibidos');
  recibidos = signal<Mensaje[]>([]);
  enviados = signal<Mensaje[]>([]);
  usuarios = signal<Usuario[]>([]);
  error = signal<string | null>(null);
  enviando = signal(false);

  destinatarioId: number | null = null;
  asunto = '';
  contenido = '';

  ngOnInit() {
    this.cargar();
    this.service.usuarios().subscribe((u) => this.usuarios.set(u));
  }

  cargar() {
    this.service.recibidos().subscribe((m) => this.recibidos.set(m));
    this.service.enviados().subscribe((m) => this.enviados.set(m));
  }

  enviar() {
    if (!this.destinatarioId) return;
    this.enviando.set(true);
    this.error.set(null);
    this.service
      .enviarMensaje({ destinatario_id: this.destinatarioId, asunto: this.asunto, contenido: this.contenido })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.asunto = '';
          this.contenido = '';
          this.destinatarioId = null;
          this.cargar();
          this.tab.set('enviados');
        },
        error: (e) => {
          this.enviando.set(false);
          this.error.set(e?.error?.detail ?? 'No se pudo enviar');
        },
      });
  }

  leer(m: Mensaje) {
    this.service.marcarLeido(m.id).subscribe(() => this.cargar());
  }

  nombre(id: number) {
    return this.usuarios().find((u) => u.id === id)?.full_name ?? 'Usuario #' + id;
  }
}
