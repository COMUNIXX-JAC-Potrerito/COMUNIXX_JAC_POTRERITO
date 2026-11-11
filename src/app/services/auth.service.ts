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

  constructor() {
    // Si la sesión se abre o se cierra en otra pestaña, esta se entera.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (ev) => {
        if (ev.key === this.TOKEN_KEY || ev.key === null) {
          this.sincronizar();
        }
      });
    }
  }

  // Inicia sesión: pide el token al backend y guarda sesión y rol.
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

  // Registra un usuario nuevo (rol "usuario" por defecto).
  register(data: RegistroData): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Cierra sesión: borra el token y limpia los signals de sesión/rol.
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.rol.set(null);
  }

  // Devuelve el token JWT guardado, o null si no hay sesión o ya venció.
  // Un token vencido se borra: así la app no se queda "logueada" con un token
  // que el backend rechaza con 401.
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token && tokenVencido(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  // Vuelve a leer la sesión desde el almacenamiento (p. ej. tras un cambio en otra pestaña).
  private sincronizar(): void {
    this.isLoggedIn.set(this.hasToken());
    this.rol.set(this.leerRol());
  }

  // ¿El usuario logueado es dignatario (puede entrar al Panel JAC)?
  esDignatario(): boolean {
    const r = this.rol();
    return r !== null && ROLES_GESTION.includes(r);
  }

  // ¿El usuario logueado es superadministrador?
  esSuperadmin(): boolean {
    return this.rol() === 'superadministrador';
  }

  // Correo del usuario logueado (viene en el token como "sub").
  emailActual(): string | null {
    return this.leerCampo('sub');
  }

  // ¿Hay un token guardado y vigente? (estado inicial de la sesión)
  private hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && !tokenVencido(token);
  }

  // Lee el rol del usuario desde el token.
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
    const valor = leerPayload(token)?.[campo];
    return typeof valor === 'string' ? valor : null;
  }
}

// Decodifica el payload del JWT (la parte del medio). No verifica la firma
// (eso lo hace el backend); solo lee los datos. Soporta tildes (UTF-8).
export function leerPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binario = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

// ¿El token ya venció? (campo "exp" en segundos). Un token ilegible cuenta como vencido.
export function tokenVencido(token: string, ahoraMs: number = Date.now()): boolean {
  const exp = leerPayload(token)?.['exp'];
  return typeof exp !== 'number' || exp * 1000 <= ahoraMs;
}
