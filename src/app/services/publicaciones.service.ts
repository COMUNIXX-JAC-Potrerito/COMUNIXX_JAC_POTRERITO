import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Publicacion, PublicacionCreate } from '../models/publicacion.model';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Lista las publicaciones (filtra por categoría si se indica).
  listar(categoria?: string): Observable<Publicacion[]> {
    const q = categoria ? `?categoria=${categoria}` : '';
    return this.http.get<Publicacion[]>(`${this.apiUrl}/publicaciones${q}`);
  }

  // Crea una publicación nueva.
  crear(data: PublicacionCreate): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/publicaciones`, data);
  }

  // Elimina una publicación por id.
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/publicaciones/${id}`);
  }
}
