import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Comunicacion,
  ComunicacionCreate,
  Mensaje,
  MensajeCreate,
  Reporte,
  Usuario,
} from '../models/comunicacion.model';

@Injectable({ providedIn: 'root' })
export class ComunicacionService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // --- Usuarios (para elegir destinatario y gestionar roles) ---
  usuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.api}/usuarios`);
  }
  cambiarRol(id: number, rol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.api}/usuarios/${id}/rol`, { rol });
  }
  cambiarComite(id: number, comite: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.api}/usuarios/${id}/comite`, { comite });
  }

  // --- Mensajería interna ---
  recibidos(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.api}/mensajes/recibidos`);
  }
  enviados(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.api}/mensajes/enviados`);
  }
  enviarMensaje(data: MensajeCreate): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.api}/mensajes`, data);
  }
  marcarLeido(id: number): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.api}/mensajes/${id}/leido`, {});
  }
  editarMensaje(id: number, contenido: string): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.api}/mensajes/${id}`, { contenido });
  }
  fijarMensaje(id: number, fijado: boolean): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.api}/mensajes/${id}/fijar`, { fijado });
  }
  eliminarMensaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/mensajes/${id}`);
  }

  // --- Comunicaciones externas ---
  listarComunicaciones(tipo?: string): Observable<Comunicacion[]> {
    const q = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<Comunicacion[]>(`${this.api}/comunicaciones${q}`);
  }
  registrarComunicacion(data: ComunicacionCreate): Observable<Comunicacion> {
    return this.http.post<Comunicacion>(`${this.api}/comunicaciones`, data);
  }
  eliminarComunicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/comunicaciones/${id}`);
  }

  // --- Envío masivo ---
  enviarMasivo(asunto: string, contenido: string): Observable<{ envio_id: number; destinatarios: number; modo: string }> {
    return this.http.post<{ envio_id: number; destinatarios: number; modo: string }>(
      `${this.api}/envios-masivos`,
      { asunto, contenido },
    );
  }

  // --- Reportes ---
  reporte(): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.api}/reportes/resumen`);
  }
}
