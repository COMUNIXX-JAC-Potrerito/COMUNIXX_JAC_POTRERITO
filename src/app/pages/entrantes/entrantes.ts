import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { COMITES, ESTADOS, Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

@Component({
  selector: 'app-entrantes',
  imports: [FormsModule],
  templateUrl: './entrantes.html',
  styleUrl: './entrantes.scss',
})
export class Entrantes implements OnInit {
  private pqrsService = inject(PqrsService);

  readonly comites = COMITES;
  readonly estados = ESTADOS;

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // PQRS abierta (vista tipo correo). null = viendo la bandeja.
  seleccionada = signal<Pqrs | null>(null);
  comiteSel = '';
  estadoSel = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.pqrsService.entrantes().subscribe({
      next: (data) => {
        this.pqrs.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'No se pudieron cargar las PQRS entrantes');
        this.cargando.set(false);
      },
    });
  }

  abrir(p: Pqrs) {
    this.seleccionada.set(p);
    this.comiteSel = '';
    this.estadoSel = '';
    this.error.set(null);
  }

  volver() {
    this.seleccionada.set(null);
  }

  asignar() {
    const p = this.seleccionada();
    if (!p || !this.comiteSel) {
      return;
    }
    this.pqrsService.asignarComite(p.id, this.comiteSel).subscribe({
      // al asignar deja de ser "entrante": sale de la bandeja
      next: () => this.sacarYVolver(p.id),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo asignar el comité'),
    });
  }

  actualizarEstado() {
    const p = this.seleccionada();
    if (!p || !this.estadoSel) {
      return;
    }
    this.pqrsService.cambiarEstado(p.id, this.estadoSel).subscribe({
      next: () => this.sacarYVolver(p.id),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo cambiar el estado'),
    });
  }

  private sacarYVolver(id: number) {
    this.pqrs.update((l) => l.filter((x) => x.id !== id));
    this.seleccionada.set(null);
  }
}
