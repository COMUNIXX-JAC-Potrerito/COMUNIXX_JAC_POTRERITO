import { DatePipe, KeyValuePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  EncuestaCreate,
  EncuestaDetalle,
  EncuestaResultados,
  EncuestaResumen,
  Participante,
  PreguntaCreate,
  RespuestaItem,
} from '../../models/encuesta.model';
import { EncuestasService } from '../../services/encuestas.service';

interface PreguntaForm {
  texto: string;
  tipo: string; // texto | opciones
  opciones: string[];
}

@Component({
  selector: 'app-admin-encuestas',
  imports: [FormsModule, DatePipe, KeyValuePipe],
  templateUrl: './admin-encuestas.html',
  styleUrl: './admin-encuestas.scss',
})
export class AdminEncuestas implements OnInit {
  private service = inject(EncuestasService);

  items = signal<EncuestaResumen[]>([]);
  error = signal<string | null>(null);
  ok = signal<string | null>(null);
  guardando = signal(false);

  // Formulario
  titulo = '';
  descripcion = '';
  tipo = 'encuesta';
  preguntas: PreguntaForm[] = [{ texto: '', tipo: 'texto', opciones: ['', ''] }];

  // Resultados abiertos
  resultados = signal<EncuestaResultados | null>(null);

  // Participantes (quién respondió) abiertos
  participantes = signal<Participante[] | null>(null);
  participantesTitulo = signal('');

  // Responder (los dignatarios también pueden participar)
  respondiendo = signal<EncuestaDetalle | null>(null);
  respuestasResp: Record<number, string> = {};
  enviandoResp = signal(false);
  graciasResp = signal(false);

  // Al abrir, carga las encuestas creadas.
  ngOnInit() {
    this.cargar();
  }

  // Abre una encuesta para que el dignatario también la responda.
  responderAbrir(e: EncuestaResumen) {
    this.error.set(null);
    this.graciasResp.set(false);
    this.respuestasResp = {};
    this.service.detalle(e.id).subscribe({
      next: (d) => this.respondiendo.set(d),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo abrir la encuesta'),
    });
  }

  // Cierra el formulario de responder.
  cerrarResponder() {
    this.respondiendo.set(null);
    this.graciasResp.set(false);
  }

  // Envía las respuestas del dignatario (usa los datos de su cuenta).
  responderEnviar() {
    const enc = this.respondiendo();
    if (!enc) {
      return;
    }
    const items: RespuestaItem[] = enc.preguntas.map((p) => ({
      pregunta_id: p.id,
      valor: this.respuestasResp[p.id] ?? null,
    }));
    this.enviandoResp.set(true);
    // Al estar logueado, el backend usa los datos de la cuenta.
    this.service.responder(enc.id, items, {}).subscribe({
      next: () => {
        this.enviandoResp.set(false);
        this.graciasResp.set(true);
      },
      error: (err) => {
        this.enviandoResp.set(false);
        this.error.set(err?.error?.detail ?? 'No se pudo enviar la respuesta');
      },
    });
  }

  // Trae todas las encuestas (incluye borradores).
  cargar() {
    this.service.listarGestion().subscribe({
      next: (d) => this.items.set(d),
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudieron cargar las encuestas'),
    });
  }

  // Agrega una pregunta al formulario.
  agregarPregunta() {
    this.preguntas.push({ texto: '', tipo: 'texto', opciones: ['', ''] });
  }
  // Quita la pregunta i del formulario.
  quitarPregunta(i: number) {
    this.preguntas.splice(i, 1);
  }
  // Agrega una opción a la pregunta i.
  agregarOpcion(i: number) {
    this.preguntas[i].opciones.push('');
  }
  // Quita la opción j de la pregunta i.
  quitarOpcion(i: number, j: number) {
    this.preguntas[i].opciones.splice(j, 1);
  }

  // Crea la encuesta con sus preguntas (valida que haya al menos una).
  crear() {
    this.error.set(null);
    this.ok.set(null);

    const preguntas: PreguntaCreate[] = this.preguntas
      .filter((p) => p.texto.trim())
      .map((p) => ({
        texto: p.texto.trim(),
        tipo: p.tipo,
        opciones: p.tipo === 'opciones' ? p.opciones.filter((o) => o.trim()) : null,
      }));

    if (preguntas.length === 0) {
      this.error.set('Agrega al menos una pregunta');
      return;
    }

    const data: EncuestaCreate = {
      titulo: this.titulo,
      descripcion: this.descripcion || null,
      tipo: this.tipo,
      preguntas,
    };

    this.guardando.set(true);
    this.service.crear(data).subscribe({
      next: () => {
        this.guardando.set(false);
        this.ok.set('Creada. Recuerda publicarla para que la comunidad la vea.');
        this.titulo = '';
        this.descripcion = '';
        this.tipo = 'encuesta';
        this.preguntas = [{ texto: '', tipo: 'texto', opciones: ['', ''] }];
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e?.error?.detail ?? 'No se pudo crear la encuesta');
      },
    });
  }

  // Publica o despublica la encuesta.
  publicar(e: EncuestaResumen) {
    this.service.publicar(e.id, !e.publicada).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo cambiar la publicación'),
    });
  }

  // Elimina la encuesta (y cierra sus resultados si estaban abiertos).
  eliminar(e: EncuestaResumen) {
    this.service.eliminar(e.id).subscribe({
      next: () => {
        if (this.resultados()?.encuesta_id === e.id) {
          this.resultados.set(null);
        }
        this.cargar();
      },
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo eliminar'),
    });
  }

  // Carga y muestra los resultados de una encuesta.
  verResultados(e: EncuestaResumen) {
    this.service.resultados(e.id).subscribe({
      next: (r) => this.resultados.set(r),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudieron cargar los resultados'),
    });
  }

  // Cierra el panel de resultados.
  cerrarResultados() {
    this.resultados.set(null);
  }

  // Carga y muestra quién respondió la encuesta.
  verParticipantes(e: EncuestaResumen) {
    this.participantesTitulo.set(e.titulo);
    this.service.participantes(e.id).subscribe({
      next: (p) => this.participantes.set(p),
      error: (err) =>
        this.error.set(err?.error?.detail ?? 'No se pudieron cargar los participantes'),
    });
  }

  // Cierra el panel de participantes.
  cerrarParticipantes() {
    this.participantes.set(null);
  }

  // Para las barras de resultados: total de una pregunta de opciones.
  totalConteo(conteo: Record<string, number> | null): number {
    if (!conteo) {
      return 0;
    }
    return Object.values(conteo).reduce((a, b) => a + b, 0);
  }

  // Porcentaje de una opción respecto al total (para el ancho de la barra).
  porcentaje(valor: number, total: number): number {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  }
}
