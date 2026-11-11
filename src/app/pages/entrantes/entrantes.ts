import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { COMITES, Pqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';
import { TipoPqrsPipe } from '../../shared/pipes';

@Component({
  selector: 'app-entrantes',
  imports: [FormsModule, TipoPqrsPipe],
  templateUrl: './entrantes.html',
  styleUrl: './entrantes.scss',
})
export class Entrantes implements OnInit {
  private pqrsService = inject(PqrsService);

  readonly comites = COMITES;

  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // PQRS abierta (vista tipo correo). null = viendo la bandeja.
  seleccionada = signal<Pqrs | null>(null);
  comiteSel = '';

  // Al abrir, carga la bandeja de entrantes.
  ngOnInit() {
    this.cargar();
  }

  // Trae las PQRS entrantes (nuevas sin asignar).
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

  // Abre una PQRS en vista de detalle (tipo correo).
  abrir(p: Pqrs) {
    this.seleccionada.set(p);
    this.comiteSel = '';
    this.error.set(null);
  }

  // Vuelve a la bandeja.
  volver() {
    this.seleccionada.set(null);
  }

  // Asigna un comité a la PQRS abierta (sale de entrantes).
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

  // Quita la PQRS de la bandeja y vuelve a la lista.
  private sacarYVolver(id: number) {
    this.pqrs.update((l) => l.filter((x) => x.id !== id));
    this.seleccionada.set(null);
  }
}
