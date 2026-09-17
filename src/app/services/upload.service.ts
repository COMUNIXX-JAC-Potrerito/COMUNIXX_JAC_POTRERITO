import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Adjunto } from '../models/comunicacion.model';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Sube un archivo (imagen, video, audio o documento) al backend, que lo
  // guarda en Cloudinary y devuelve su URL pública.
  subir(archivo: File): Observable<Adjunto> {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.post<Adjunto>(`${this.api}/uploads`, form);
  }
}
