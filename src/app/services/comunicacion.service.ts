import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CargaComite,
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
  // Lista todos los usuarios.
  usuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.api}/usuarios`);
  }
  // Cambia el rol de un usuario (solo superadmin).
  cambiarRol(id: number, rol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.api}/usuarios/${id}/rol`, { rol });
  }
  // Asigna/quita la comisión de un usuario (solo superadmin).
  cambiarComite(id: number, comite: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.api}/usuarios/${id}/comite`, { comite });
  }

  // --- Mensajería interna ---
  // Mensajes recibidos por el dignatario.
  recibidos(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.api}/mensajes/recibidos`);
  }
  // Mensajes enviados por el dignatario.
  enviados(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.api}/mensajes/enviados`);
  }
  // Envía un mensaje interno.
  enviarMensaje(data: MensajeCreate): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.api}/mensajes`, data);
  }
  // Marca un mensaje como leído.
  marcarLeido(id: number): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.api}/mensajes/${id}/leido`, {});
  }
  // Edita el contenido de un mensaje (15 min).
  editarMensaje(id: number, contenido: string): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.api}/mensajes/${id}`, { contenido });
  }
  // Fija o desfija un mensaje.
  fijarMensaje(id: number, fijado: boolean): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.api}/mensajes/${id}/fijar`, { fijado });
  }
  // Elimina un mensaje.
  eliminarMensaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/mensajes/${id}`);
  }

  // --- Comunicaciones externas ---
  // Lista las comunicaciones externas (filtra por tipo si se indica).
  listarComunicaciones(tipo?: string): Observable<Comunicacion[]> {
    const q = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<Comunicacion[]>(`${this.api}/comunicaciones${q}`);
  }
  // Registra una comunicación externa en la bitácora.
  registrarComunicacion(data: ComunicacionCreate): Observable<Comunicacion> {
    return this.http.post<Comunicacion>(`${this.api}/comunicaciones`, data);
  }
  // Elimina una comunicación de la bitácora.
  eliminarComunicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/comunicaciones/${id}`);
  }

  // --- Envío masivo ---
  // Envía un comunicado por correo a todos los registrados.
  enviarMasivo(asunto: string, contenido: string): Observable<{ envio_id: number; destinatarios: number; modo: string }> {
    return this.http.post<{ envio_id: number; destinatarios: number; modo: string }>(
      `${this.api}/envios-masivos`,
      { asunto, contenido },
    );
  }

  // --- Reportes ---
  // Trae el resumen con los conteos del sistema.
  reporte(): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.api}/reportes/resumen`);
  }

  // Trae el trabajo pendiente de cada comité.
  cargaComites(): Observable<CargaComite[]> {
    return this.http.get<CargaComite[]>(`${this.api}/reportes/carga-comites`);
  }
}
