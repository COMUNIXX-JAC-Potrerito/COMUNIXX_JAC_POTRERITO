// Cálculos del tablero de información y estadísticas.
// Son funciones puras (sin Angular ni HTTP) para poder probarlas fácilmente.

import { COMITES, ESTADOS, Pqrs, TIPOS } from '../../models/pqrs.model';
import { aFecha } from '../../shared/formato';

export type Periodo = '3m' | '6m' | '12m' | 'todo';

export const PERIODOS: { valor: Periodo; etiqueta: string }[] = [
  { valor: '3m', etiqueta: '3 meses' },
  { valor: '6m', etiqueta: '6 meses' },
  { valor: '12m', etiqueta: '12 meses' },
  { valor: 'todo', etiqueta: 'Todo' },
];

const MESES_POR_PERIODO: Record<Exclude<Periodo, 'todo'>, number> = { '3m': 3, '6m': 6, '12m': 12 };
// En "Todo" el gráfico mensual muestra como máximo los últimos 24 meses.
const MAX_MESES_GRAFICO = 24;
const MS_POR_HORA = 60 * 60 * 1000;

export interface Indicadores {
  total: number;
  pendientes: number; // todo lo que no está Finalizada
  finalizadas: number;
  tasaResolucion: number | null; // 0..1, null si no hay PQRS
  sinAsignar: number; // sin comité
  anonimas: number;
  sinRespuesta: number; // pendientes que aún no tienen ninguna respuesta
  medianaPrimeraRespuestaHoras: number | null;
}

export interface Conteo {
  clave: string;
  cantidad: number;
}

export interface Mes {
  clave: string; // "2026-11"
  etiqueta: string; // "nov"
  etiquetaLarga: string; // "noviembre de 2026"
  total: number;
}

export interface CargaComite {
  comite: string;
  enProceso: number;
  porAtender: number; // Nueva o En espera
  finalizadas: number;
  total: number;
  pendientes: number;
}

// Primer día (hora local) del mes que está `meses - 1` meses antes de `ahora`.
function inicioDeVentana(meses: number, ahora: Date): Date {
  return new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1), 1);
}

// PQRS radicadas dentro del periodo (contando el mes en curso como un mes completo).
export function filtrarPorPeriodo(pqrs: Pqrs[], periodo: Periodo, ahora = new Date()): Pqrs[] {
  if (periodo === 'todo') {
    return pqrs;
  }
  const desde = inicioDeVentana(MESES_POR_PERIODO[periodo], ahora).getTime();
  return pqrs.filter((p) => (aFecha(p.created_at)?.getTime() ?? 0) >= desde);
}

// Fecha de la primera respuesta de la JAC (hilo nuevo o respuesta única antigua).
export function fechaPrimeraRespuesta(p: Pqrs): Date | null {
  const fechas = (p.respuestas ?? [])
    .map((r) => aFecha(r.created_at))
    .filter((f): f is Date => f !== null);
  if (fechas.length === 0 && p.respuesta) {
    const legado = aFecha(p.respuesta_fecha);
    if (legado) {
      fechas.push(legado);
    }
  }
  if (fechas.length === 0) {
    return null;
  }
  return new Date(Math.min(...fechas.map((f) => f.getTime())));
}

function tieneRespuesta(p: Pqrs): boolean {
  return (p.respuestas?.length ?? 0) > 0 || !!p.respuesta;
}

export function mediana(valores: number[]): number | null {
  if (valores.length === 0) {
    return null;
  }
  const orden = [...valores].sort((a, b) => a - b);
  const medio = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[medio] : (orden[medio - 1] + orden[medio]) / 2;
}

export function calcularIndicadores(pqrs: Pqrs[]): Indicadores {
  const finalizadas = pqrs.filter((p) => p.estado === 'Finalizada').length;
  const pendientes = pqrs.length - finalizadas;
  const horas = pqrs
    .map((p) => {
      const radicada = aFecha(p.created_at);
      const respuesta = fechaPrimeraRespuesta(p);
      return radicada && respuesta ? (respuesta.getTime() - radicada.getTime()) / MS_POR_HORA : null;
    })
    .filter((h): h is number => h !== null && h >= 0);

  return {
    total: pqrs.length,
    pendientes,
    finalizadas,
    tasaResolucion: pqrs.length ? finalizadas / pqrs.length : null,
    sinAsignar: pqrs.filter((p) => !p.comite).length,
    anonimas: pqrs.filter((p) => p.es_anonima).length,
    sinRespuesta: pqrs.filter((p) => p.estado !== 'Finalizada' && !tieneRespuesta(p)).length,
    medianaPrimeraRespuestaHoras: mediana(horas),
  };
}

// Conteo por cada valor de un catálogo, en el orden fijo del catálogo.
function contarSegun(pqrs: Pqrs[], catalogo: string[], campo: 'estado' | 'tipo'): Conteo[] {
  return catalogo.map((clave) => ({
    clave,
    cantidad: pqrs.filter((p) => p[campo] === clave).length,
  }));
}

export function contarPorEstado(pqrs: Pqrs[]): Conteo[] {
  return contarSegun(pqrs, ESTADOS, 'estado');
}

export function contarPorTipo(pqrs: Pqrs[]): Conteo[] {
  return contarSegun(pqrs, TIPOS, 'tipo');
}

// PQRS radicadas por mes, con todos los meses del periodo (también los que tienen 0).
export function radicadasPorMes(pqrs: Pqrs[], periodo: Periodo, ahora = new Date()): Mes[] {
  let meses: number;
  if (periodo === 'todo') {
    const fechas = pqrs.map((p) => aFecha(p.created_at)).filter((f): f is Date => f !== null);
    if (fechas.length === 0) {
      meses = 6;
    } else {
      const primera = new Date(Math.min(...fechas.map((f) => f.getTime())));
      const diferencia =
        (ahora.getFullYear() - primera.getFullYear()) * 12 + (ahora.getMonth() - primera.getMonth()) + 1;
      meses = Math.min(Math.max(diferencia, 1), MAX_MESES_GRAFICO);
    }
  } else {
    meses = MESES_POR_PERIODO[periodo];
  }

  const resultado: Mes[] = [];
  const indice = new Map<string, Mes>();
  for (let i = meses - 1; i >= 0; i--) {
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const clave = claveMes(inicio);
    const mes: Mes = {
      clave,
      etiqueta: inicio.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
      etiquetaLarga: inicio.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
      total: 0,
    };
    resultado.push(mes);
    indice.set(clave, mes);
  }
  for (const p of pqrs) {
    const fecha = aFecha(p.created_at);
    const mes = fecha ? indice.get(claveMes(fecha)) : undefined;
    if (mes) {
      mes.total++;
    }
  }
  return resultado;
}

function claveMes(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

// Carga de trabajo por comité: solo los comités con PQRS, primero los de más pendientes.
export function cargaPorComite(pqrs: Pqrs[]): CargaComite[] {
  return COMITES.map((comite) => {
    const delComite = pqrs.filter((p) => p.comite === comite);
    const enProceso = delComite.filter((p) => p.estado === 'En_Proceso').length;
    const finalizadas = delComite.filter((p) => p.estado === 'Finalizada').length;
    const total = delComite.length;
    return {
      comite,
      enProceso,
      finalizadas,
      porAtender: total - enProceso - finalizadas,
      total,
      pendientes: total - finalizadas,
    };
  })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.pendientes - a.pendientes || b.total - a.total);
}

// "45 min", "5 h", "2,5 días"
export function formatoDuracion(horas: number | null): string {
  if (horas === null) {
    return '—';
  }
  if (horas < 1) {
    return `${Math.max(1, Math.round(horas * 60))} min`;
  }
  if (horas < 48) {
    return `${Math.round(horas)} h`;
  }
  const dias = Math.round((horas / 24) * 10) / 10;
  return `${dias.toLocaleString('es-CO')} días`;
}

// "75 %" a partir de 0.75
export function formatoPorcentaje(valor: number | null): string {
  return valor === null ? '—' : `${Math.round(valor * 100)} %`;
}

// Límite superior "redondo" del eje. Siempre es par, para que la marca del medio
// (máximo / 2) también sea un número entero: 4, 10, 20, 50, 100...
export function maximoEje(valor: number): number {
  if (valor <= 4) {
    return 4;
  }
  if (valor <= 10) {
    return 10;
  }
  const potencia = Math.pow(10, Math.floor(Math.log10(valor)));
  for (const paso of [1, 2, 5, 10]) {
    if (paso * potencia >= valor) {
      return paso * potencia;
    }
  }
  return 10 * potencia;
}
