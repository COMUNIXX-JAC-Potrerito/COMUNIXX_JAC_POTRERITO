import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth.service';

// Una opción del menú (enlace a una pantalla del panel).
interface ItemMenu {
  etiqueta: string;
  ruta: string;
  soloSuperadmin?: boolean;
}

// Un grupo desplegable del menú lateral, con sus opciones.
interface GrupoMenu {
  id: string;
  titulo: string;
  items: ItemMenu[];
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Grupos del menú lateral: cada uno agrupa opciones por su función.
  readonly grupos: GrupoMenu[] = [
    {
      id: 'pqrs',
      titulo: 'PQRS',
      items: [
        { etiqueta: 'Entrantes', ruta: 'entrantes' },
        { etiqueta: 'Mis asignadas', ruta: 'asignadas' },
        { etiqueta: 'Mis PQRS', ruta: 'mis-pqrs' },
        { etiqueta: 'Historial', ruta: 'historial' },
        { etiqueta: 'Radicar PQRS', ruta: 'radicar' },
      ],
    },
    {
      id: 'comunidad',
      titulo: 'Comunidad',
      items: [
        { etiqueta: 'Publicaciones', ruta: 'publicaciones' },
        { etiqueta: 'Comunicaciones', ruta: 'comunicaciones' },
        { etiqueta: 'Encuestas', ruta: 'encuestas' },
      ],
    },
    {
      id: 'admin',
      titulo: 'Administración',
      items: [
        { etiqueta: 'Reportes', ruta: 'reportes' },
        { etiqueta: 'Usuarios', ruta: 'usuarios', soloSuperadmin: true },
      ],
    },
  ];

  // Menú lateral abierto/cerrado (solo aplica en móvil, con el botón ☰).
  menuAbierto = signal(false);

  // Grupo desplegado actualmente (solo uno abierto a la vez, tipo acordeón).
  grupoAbierto = signal<string>(this.grupoDeRutaActual());

  // ¿El usuario es superadmin? (para mostrar la opción "Usuarios").
  esSuperadmin(): boolean {
    return this.auth.esSuperadmin();
  }

  // Opciones visibles de un grupo según el rol (oculta las de solo superadmin).
  itemsVisibles(grupo: GrupoMenu): ItemMenu[] {
    return grupo.items.filter((i) => !i.soloSuperadmin || this.esSuperadmin());
  }

  // ¿Está desplegado este grupo?
  grupoEstaAbierto(id: string): boolean {
    return this.grupoAbierto() === id;
  }

  // Despliega el grupo tocado y cierra los demás (acordeón).
  alternarGrupo(id: string) {
    this.grupoAbierto.update((actual) => (actual === id ? '' : id));
  }

  // Averigua a qué grupo pertenece la ruta actual, para abrirlo al entrar.
  private grupoDeRutaActual(): string {
    const url = this.router.url;
    const grupo = this.grupos.find((g) => g.items.some((i) => url.includes(i.ruta)));
    return grupo ? grupo.id : 'pqrs';
  }

  // Abre/cierra el menú lateral en móvil (botón hamburguesa).
  toggleMenu() {
    this.menuAbierto.update((v) => !v);
  }

  // Cierra el menú lateral (al elegir una opción en móvil).
  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  // Cierra sesión y vuelve al login.
  salir() {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
