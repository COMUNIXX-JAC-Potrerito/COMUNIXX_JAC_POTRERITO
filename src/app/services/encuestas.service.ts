import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  EncuestaCreate,
  EncuestaDetalle,
  EncuestaResultados,
  EncuestaResumen,
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

  detalle(id: number): Observable<EncuestaDetalle> {
    return this.http.get<EncuestaDetalle>(`${this.api}/encuestas/${id}`);
  }

  crear(data: EncuestaCreate): Observable<EncuestaDetalle> {
    return this.http.post<EncuestaDetalle>(`${this.api}/encuestas`, data);
  }

  publicar(id: number, publicada: boolean): Observable<EncuestaResumen> {
    return this.http.put<EncuestaResumen>(`${this.api}/encuestas/${id}/publicar`, { publicada });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/encuestas/${id}`);
  }

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

  resultados(id: number): Observable<EncuestaResultados> {
    return this.http.get<EncuestaResultados>(`${this.api}/encuestas/${id}/resultados`);
  }
}
