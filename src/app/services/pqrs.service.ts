import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Pqrs } from '../models/pqrs.model';

@Injectable({ providedIn: 'root' })
export class PqrsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Solo las PQRS en estado "Nueva".
  entrantes(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/entrantes`);
  }

  // Todas las PQRS (historial completo).
  historial(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.apiUrl}/pqrs/historial`);
  }

  asignarComite(id: number, comite: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/asignar`, { comite });
  }

  cambiarEstado(id: number, estado: string): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.apiUrl}/pqrs/${id}/estado`, { estado });
  }
}
