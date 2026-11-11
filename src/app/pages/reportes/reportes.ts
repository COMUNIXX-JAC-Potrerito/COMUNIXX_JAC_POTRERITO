import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Reporte } from '../../models/comunicacion.model';
import { Pqrs } from '../../models/pqrs.model';
import { ComunicacionService } from '../../services/comunicacion.service';
import { PqrsService } from '../../services/pqrs.service';
import { etiquetaEstado, etiquetaTipo } from '../../shared/formato';
import {
  PERIODOS,
  Periodo,
  calcularIndicadores,
  cargaPorComite,
  contarPorEstado,
  contarPorTipo,
  filtrarPorPeriodo,
  formatoDuracion,
  formatoPorcentaje,
  maximoEje,
  radicadasPorMes,
} from './estadisticas';

// Color de cada estado en los gráficos (paleta validada para daltonismo).
const COLOR_ESTADO: Record<string, string> = {
  Nueva: 'var(--viz-nueva)',
  En_Proceso: 'var(--viz-proceso)',
  En_Espera: 'var(--viz-espera)',
  Finalizada: 'var(--viz-finalizada)',
};

const CLAVE_PERIODO = 'comunix_reportes_periodo';

// Lee el periodo elegido la última vez (si el navegador lo permite).
function periodoGuardado(): Periodo {
  try {
    const valor = localStorage.getItem(CLAVE_PERIODO);
    return PERIODOS.some((p) => p.valor === valor) ? (valor as Periodo) : '6m';
  } catch {
    return '6m';
  }
}

@Component({
  selector: 'app-reportes',
  imports: [],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private comunicacion = inject(ComunicacionService);
  private pqrsService = inject(PqrsService);

  readonly periodos = PERIODOS;
  readonly duracion = formatoDuracion;
  readonly porcentaje = formatoPorcentaje;

  resumen = signal<Reporte | null>(null);
  pqrs = signal<Pqrs[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  actualizado = signal<Date | null>(null);
  periodo = signal<Periodo>(periodoGuardado());

  // --- Datos derivados (se recalculan solos al cambiar el periodo o los datos) ---
  filtradas = computed(() => filtrarPorPeriodo(this.pqrs(), this.periodo()));
  kpi = computed(() => calcularIndicadores(this.filtradas()));

  porEstado = computed(() => {
    const total = this.filtradas().length;
    return contarPorEstado(this.filtradas()).map((c) => ({
      ...c,
      etiqueta: etiquetaEstado(c.clave),
      color: COLOR_ESTADO[c.clave],
      fraccion: total ? c.cantidad / total : 0,
    }));
  });

  porTipo = computed(() => {
    const conteos = contarPorTipo(this.filtradas());
    const max = maximoEje(Math.max(0, ...conteos.map((c) => c.cantidad)));
    return conteos.map((c) => ({ ...c, etiqueta: etiquetaTipo(c.clave), ancho: (c.cantidad / max) * 100 }));
  });

  porMes = computed(() => {
    const meses = radicadasPorMes(this.filtradas(), this.periodo());
    const max = maximoEje(Math.max(0, ...meses.map((m) => m.total)));
    const mayor = Math.max(...meses.map((m) => m.total));
    return {
      max,
      meses: meses.map((m, i) => ({
        ...m,
        alto: (m.total / max) * 100,
        // Etiqueta visible solo en el mes más alto y en el último (el resto, al pasar el cursor).
        rotular: m.total > 0 && (m.total === mayor || i === meses.length - 1),
      })),
    };
  });

  carga = computed(() => {
    const filas = cargaPorComite(this.filtradas());
    const max = maximoEje(Math.max(0, ...filas.map((f) => f.total)));
    // El largo de la barra es el total del comité respecto al eje; los segmentos se reparten dentro.
    return filas.map((f) => ({ ...f, fraccion: f.total / max }));
  });

  etiquetaPeriodo = computed(() => {
    const p = this.periodo();
    return p === 'todo' ? 'desde el inicio' : `en los últimos ${p.replace('m', '')} meses`;
  });

  ngOnInit() {
    this.cargar();
  }

  // Trae el resumen general y todas las PQRS (de ellas salen los gráficos).
  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({ resumen: this.comunicacion.reporte(), pqrs: this.pqrsService.historial() }).subscribe({
      next: ({ resumen, pqrs }) => {
        this.resumen.set(resumen);
        this.pqrs.set(pqrs);
        this.actualizado.set(new Date());
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.detail ?? 'No se pudieron cargar las estadísticas');
        this.cargando.set(false);
      },
    });
  }

  // Cambia el periodo de los gráficos y lo recuerda para la próxima visita.
  elegirPeriodo(p: Periodo) {
    this.periodo.set(p);
    try {
      localStorage.setItem(CLAVE_PERIODO, p);
    } catch {
      // Sin almacenamiento disponible: el periodo solo dura mientras la página esté abierta.
    }
  }

  horaActualizado(): string {
    return this.actualizado()?.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) ?? '';
  }

  // "1 PQRS" / "3 PQRS", "1 día" / "2 días"...
  plural(n: number, singular: string, varios: string): string {
    return `${n.toLocaleString('es-CO')} ${n === 1 ? singular : varios}`;
  }
}
