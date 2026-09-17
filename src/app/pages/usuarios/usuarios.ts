import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Usuario } from '../../models/comunicacion.model';
import { COMITES } from '../../models/pqrs.model';
import { ComunicacionService } from '../../services/comunicacion.service';

// Roles válidos (deben coincidir con el backend: roles.py).
const ROLES = ['usuario', 'administrador', 'superadministrador', 'entidad'];

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private service = inject(ComunicacionService);

  readonly roles = ROLES;
  readonly comites = COMITES;

  items = signal<Usuario[]>([]);
  error = signal<string | null>(null);
  ok = signal<string | null>(null);

  // Selección por fila.
  rolSel: Record<number, string> = {};
  comiteSel: Record<number, string> = {};

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.error.set(null);
    this.service.usuarios().subscribe({
      next: (u) => {
        this.items.set(u);
        u.forEach((x) => {
          this.rolSel[x.id] = x.role;
          this.comiteSel[x.id] = x.comite ?? '';
        });
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudieron cargar los usuarios'),
    });
  }

  cambiarRol(u: Usuario) {
    const rol = this.rolSel[u.id];
    if (!rol || rol === u.role) {
      return;
    }
    this.error.set(null);
    this.ok.set(null);
    this.service.cambiarRol(u.id, rol).subscribe({
      next: () => {
        this.ok.set(`Rol de ${u.full_name} actualizado a "${rol}".`);
        this.cargar();
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo cambiar el rol'),
    });
  }

  cambiarComite(u: Usuario) {
    const comite = this.comiteSel[u.id] ?? '';
    if (comite === (u.comite ?? '')) {
      return;
    }
    this.error.set(null);
    this.ok.set(null);
    this.service.cambiarComite(u.id, comite).subscribe({
      next: () => {
        this.ok.set(
          comite
            ? `${u.full_name} quedó en la comisión "${comite}".`
            : `${u.full_name} quedó sin comisión.`,
        );
        this.cargar();
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo cambiar la comisión'),
    });
  }
}
