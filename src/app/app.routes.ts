import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Área pública (comunidad)
  {
    path: '',
    loadComponent: () => import('./pages/publico/publico').then((m) => m.Publico),
    children: [
      { path: '', loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio) },
      { path: 'radicar', loadComponent: () => import('./pages/radicar/radicar').then((m) => m.Radicar) },
      { path: 'consultar', loadComponent: () => import('./pages/consultar/consultar').then((m) => m.Consultar) },
      { path: 'publicaciones', loadComponent: () => import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones) },
      { path: 'registro', loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro) },
    ],
  },

  // Acceso privado (dignatarios)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      { path: '', redirectTo: 'entrantes', pathMatch: 'full' },
      { path: 'entrantes', loadComponent: () => import('./pages/entrantes/entrantes').then((m) => m.Entrantes) },
      { path: 'asignadas', loadComponent: () => import('./pages/asignadas/asignadas').then((m) => m.Asignadas) },
      { path: 'historial', loadComponent: () => import('./pages/historial/historial').then((m) => m.Historial) },
      { path: 'radicar', loadComponent: () => import('./pages/radicar/radicar').then((m) => m.Radicar) },
      { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios').then((m) => m.Usuarios) },
      { path: 'publicaciones', loadComponent: () => import('./pages/admin-publicaciones/admin-publicaciones').then((m) => m.AdminPublicaciones) },
      { path: 'mensajes', loadComponent: () => import('./pages/mensajes/mensajes').then((m) => m.Mensajes) },
      { path: 'comunicaciones', loadComponent: () => import('./pages/comunicaciones/comunicaciones').then((m) => m.Comunicaciones) },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes').then((m) => m.Reportes) },
    ],
  },

  { path: '**', redirectTo: '' },
];
