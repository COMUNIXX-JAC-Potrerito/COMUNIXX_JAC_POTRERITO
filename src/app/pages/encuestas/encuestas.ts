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
  protected auth = inject(AuthService);

  items = signal<EncuestaResumen[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Encuesta abierta para responder
  actual = signal<EncuestaDetalle | null>(null);
  respuestas: Record<number, string> = {};
  enviando = signal(false);
  gracias = signal(false);

  // IDs de encuestas que el usuario logueado ya respondió (no se repiten).
  respondidas = signal<Set<number>>(new Set());

  // Datos personales (obligatorios solo si NO está logueado).
  nombre = '';
  email = '';
  telefono = '';

  // Al abrir, carga las encuestas y, si hay sesión, cuáles ya respondió.
  ngOnInit() {
    this.cargar();
    if (this.auth.isLoggedIn()) {
      this.service.misRespuestas().subscribe({
        next: (ids) => this.respondidas.set(new Set(ids)),
        error: () => {},
      });
    }
  }

  // Trae las encuestas disponibles para la comunidad.
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

  // ¿El usuario logueado ya respondió esta encuesta?
  yaRespondio(id: number): boolean {
    return this.respondidas().has(id);
  }

  // Abre una encuesta. Si ya la respondió, muestra el mensaje de enviada.
  abrir(e: EncuestaResumen) {
    this.error.set(null);
    this.gracias.set(false);
    this.respuestas = {};
    this.nombre = '';
    this.email = '';
    this.telefono = '';
    const yaRespondida = this.yaRespondio(e.id);
    this.service.detalle(e.id).subscribe({
      next: (d) => {
        this.actual.set(d);
        if (yaRespondida) {
          this.gracias.set(true);
        }
      },
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo abrir la encuesta'),
    });
  }

  // Vuelve a la lista de encuestas.
  volver() {
    this.actual.set(null);
    this.gracias.set(false);
  }

  // Envía las respuestas. Si hay sesión, el backend autocompleta los datos.
  responder() {
    const enc = this.actual();
    if (!enc) {
      return;
    }
    // Los datos personales solo se exigen a quien NO tiene sesión.
    if (!this.auth.isLoggedIn()) {
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
          // Marca la encuesta como respondida para no ofrecerla de nuevo.
          this.respondidas.update((s) => new Set(s).add(enc.id));
          this.gracias.set(true);
        },
        error: (err) => {
          this.enviando.set(false);
          // Si ya la había respondido (409), igual muestra el mensaje de enviada.
          if (err?.status === 409) {
            this.respondidas.update((s) => new Set(s).add(enc.id));
            this.gracias.set(true);
            return;
          }
          this.error.set(err?.error?.detail ?? 'No se pudo enviar la respuesta');
        },
      });
  }
}
