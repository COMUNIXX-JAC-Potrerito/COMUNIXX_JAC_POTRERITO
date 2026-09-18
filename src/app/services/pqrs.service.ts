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
  radicar(data: PqrsCreate): Observable<Pqrs> {
    return this.http.post<Pqrs>(`${this.apiUrl}/pqrs`, data);
  }

  seguimiento(codigo: string): Observable<PqrsSeguimiento> {
    return this.http.get<PqrsSeguimiento>(`${this.apiUrl}/pqrs/seguimiento/${codigo}`);
  }

  // --- Privado (requiere token) ---
  entrantes(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/entrantes`);
  }

  historial(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/historial`);
  }

  asignadas(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/asignadas`);
  }

  mias(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/mias`);
  }

  responder(id: number, respuesta: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/responder`, { respuesta });
  }

  asignarComite(id: number, comite: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/asignar`, { comite });
  }

  cambiarEstado(id: number, estado: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/estado`, { estado });
  }
}
