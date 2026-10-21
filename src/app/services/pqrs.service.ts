import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Pqrs, PqrsCreate, PqrsSeguimiento } from '../models/pqrs.model';

@Injectable({ providedIn: 'root' })
export class PqrsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- Público ---
  // Radica una PQRS nueva.
  radicar(data: PqrsCreate): Observable<Pqrs> {
    return this.http.post<Pqrs>(`${this.apiUrl}/pqrs`, data);
  }

  // Consulta el estado de una PQRS por su código de seguimiento.
  seguimiento(codigo: string): Observable<PqrsSeguimiento> {
    return this.http.get<PqrsSeguimiento>(`${this.apiUrl}/pqrs/seguimiento/${codigo}`);
  }

  // --- Privado (requiere token) ---
  // Lista las PQRS entrantes (nuevas sin asignar).
  entrantes(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/entrantes`);
  }

  // Lista todas las PQRS (historial).
  historial(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/historial`);
  }

  // Lista las PQRS de la comisión del dignatario.
  asignadas(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/asignadas`);
  }

  // Lista las PQRS que radicó el propio usuario.
  mias(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/mias`);
  }

  // Guarda la respuesta de la JAC a una PQRS.
  responder(id: number, respuesta: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/responder`, { respuesta });
  }

  // Asigna una PQRS a un comité.
  asignarComite(id: number, comite: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/asignar`, { comite });
  }

  // Cambia el estado de una PQRS.
  cambiarEstado(id: number, estado: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/estado`, { estado });
  }
}
