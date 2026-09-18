import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EncuestaDetalle, EncuestaResumen, RespuestaItem } from '../../models/encuesta.model';
import { AuthService } from '../../services/auth.service';
import { EncuestasService } from '../../services/encuestas.service';

@Component({
  selector: 'app-encuestas',
  imports: [FormsModule],
  templateUrl: './encuestas.html',
  styleUrl: './encuestas.scss',
})
export class Encuestas implements OnInit {
  private service = inject(EncuestasService);
  private auth = inject(AuthService);

  items = signal<EncuestaResumen[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Encuesta abierta para responder
  actual = signal<EncuestaDetalle | null>(null);
  respuestas: Record<number, string> = {};
  enviando = signal(false);
  gracias = signal(false);

  // Datos personales (obligatorios si no está logueado)
  nombre = '';
  email = '';
  telefono = '';

  logueado(): boolean {
    return this.auth.isLoggedIn();
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listarPublicas().subscribe({
      next: (d) => {
        this.items.set(d);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrir(e: EncuestaResumen) {
    this.error.set(null);
    this.gracias.set(false);
    this.respuestas = {};
    this.nombre = '';
    this.email = '';
    this.telefono = '';
    this.service.detalle(e.id).subscribe({
      next: (d) => this.actual.set(d),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo abrir la encuesta'),
    });
  }

  volver() {
    this.actual.set(null);
    this.gracias.set(false);
  }

  responder() {
    const enc = this.actual();
    if (!enc) {
      return;
    }
    // Datos personales obligatorios si no está logueado.
    if (!this.logueado()) {
      if (!this.nombre.trim() || (!this.email.trim() && !this.telefono.trim())) {
        this.error.set('Indica tu nombre y un correo o teléfono para responder');
        return;
      }
    }

    const items: RespuestaItem[] = enc.preguntas.map((p) => ({
      pregunta_id: p.id,
      valor: this.respuestas[p.id] ?? null,
    }));

    this.enviando.set(true);
    this.error.set(null);
    this.service
      .responder(enc.id, items, {
        nombre: this.nombre || undefined,
        email: this.email || undefined,
        telefono: this.telefono || undefined,
      })
      .subscribe({
      next: () => {
        this.enviando.set(false);
        this.gracias.set(true);
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err?.error?.detail ?? 'No se pudo enviar la respuesta');
      },
    });
  }
}
