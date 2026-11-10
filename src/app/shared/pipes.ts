import { Pipe, PipeTransform } from '@angular/core';

import { EstiloFecha, capitalizar, etiquetaEstado, etiquetaTipo, fechaDia, fechaLocal } from './formato';

// {{ p.created_at | fechaLocal }}  -> "10 nov 2026, 9:00 a. m." (hora local)
@Pipe({ name: 'fechaLocal' })
export class FechaLocalPipe implements PipeTransform {
  transform(iso: string | null | undefined, estilo: EstiloFecha = 'completa'): string {
    return fechaLocal(iso, estilo);
  }
}

// {{ p.estado | estado }}  -> "En proceso"
@Pipe({ name: 'estado' })
export class EstadoPipe implements PipeTransform {
  transform(estado: string | null | undefined): string {
    return etiquetaEstado(estado);
  }
}

// {{ p.tipo | tipoPqrs }}  -> "Petición"
@Pipe({ name: 'tipoPqrs' })
export class TipoPqrsPipe implements PipeTransform {
  transform(tipo: string | null | undefined): string {
    return etiquetaTipo(tipo);
  }
}

// {{ e.tipo | capitalizar }}  -> "Censo"
@Pipe({ name: 'capitalizar' })
export class CapitalizarPipe implements PipeTransform {
  transform(texto: string | null | undefined): string {
    return capitalizar(texto);
  }
}

// {{ p.fecha_evento | fechaDia }}  -> "viernes, 20 de noviembre de 2026"
@Pipe({ name: 'fechaDia' })
export class FechaDiaPipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    return fechaDia(iso);
  }
}
