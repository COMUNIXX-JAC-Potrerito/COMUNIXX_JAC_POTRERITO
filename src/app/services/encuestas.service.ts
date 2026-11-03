import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  EncuestaCreate,
  EncuestaDetalle,
  EncuestaResultados,
  EncuestaResumen,
  Participante,
  RespuestaItem,
} from '../models/encuesta.model';

@Injectable({ providedIn: 'root' })
export class EncuestasService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Público: encuestas publicadas
  listarPublicas(): Observable<EncuestaResumen[]> {
    return this.http.get<EncuestaResumen[]>(`${this.api}/encuestas`);
  }

  // Dignatarios: todas (incluye borradores)
  listarGestion(): Observable<EncuestaResumen[]> {
    return this.http.get<EncuestaResumen[]>(`${this.api}/encuestas/gestion`);
  }

  // Trae una encuesta con sus preguntas.
  detalle(id: number): Observable<EncuestaDetalle> {
    return this.http.get<EncuestaDetalle>(`${this.api}/encuestas/${id}`);
  }

  // Crea una encuesta/censo.
  crear(data: EncuestaCreate): Observable<EncuestaDetalle> {
    return this.http.post<EncuestaDetalle>(`${this.api}/encuestas`, data);
  }

  // Publica o despublica una encuesta.
  publicar(id: number, publicada: boolean): Observable<EncuestaResumen> {
    return this.http.put<EncuestaResumen>(`${this.api}/encuestas/${id}/publicar`, { publicada });
  }

  // Elimina una encuesta.
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/encuestas/${id}`);
  }

  // Envía las respuestas de una encuesta (con datos personales).
  responder(
    id: number,
    items: RespuestaItem[],
    datos: { nombre?: string; email?: string; telefono?: string },
  ): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.api}/encuestas/${id}/responder`, {
      items,
      ...datos,
    });
  }

  // Trae los resultados agregados de una encuesta.
  resultados(id: number): Observable<EncuestaResultados> {
    return this.http.get<EncuestaResultados>(`${this.api}/encuestas/${id}/resultados`);
  }

  // Lista quién respondió una encuesta.
  participantes(id: number): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${this.api}/encuestas/${id}/participantes`);
  }
}
