import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { RegistroData } from '../models/pqrs.model';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Roles con acceso al Panel JAC (dignatarios).
const ROLES_GESTION = ['administrador', 'superadministrador'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'comunixx_token';

  // Señales reactivas: sesión y rol actual (leídos del token).
  readonly isLoggedIn = signal<boolean>(this.hasToken());
  readonly rol = signal<string | null>(this.leerRol());

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.access_token);
          this.isLoggedIn.set(true);
          this.rol.set(this.leerRol());
        }),
      );
  }

  register(data: RegistroData): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.rol.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ¿El usuario logueado es dignatario (puede entrar al Panel JAC)?
  esDignatario(): boolean {
    const r = this.rol();
    return r !== null && ROLES_GESTION.includes(r);
  }

  esSuperadmin(): boolean {
    return this.rol() === 'superadministrador';
  }

  // Correo del usuario logueado (viene en el token como "sub").
  emailActual(): string | null {
    return this.leerCampo('sub');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private leerRol(): string | null {
    return this.leerCampo('role');
  }

  // Decodifica el payload del JWT (la parte del medio) y devuelve un campo.
  // No verifica la firma (eso lo hace el backend); solo lee el dato.
  private leerCampo(campo: string): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const data = JSON.parse(json);
      return data[campo] ?? null;
    } catch {
      return null;
    }
  }
}
