// Formato de datos para mostrarlos en pantalla (fechas y etiquetas legibles).

// Etiqueta con ortografía correcta de cada estado (el backend usa códigos sin espacios).
const ETIQUETAS_ESTADO: Record<string, string> = {
  Nueva: 'Nueva',
  En_Proceso: 'En proceso',
  En_Espera: 'En espera',
  Finalizada: 'Finalizada',
};

// Etiqueta con tilde de cada tipo de PQRS (el backend guarda "Peticion").
const ETIQUETAS_TIPO: Record<string, string> = {
  Peticion: 'Petición',
  Queja: 'Queja',
  Reclamo: 'Reclamo',
  Sugerencia: 'Sugerencia',
};

export function etiquetaEstado(estado: string | null | undefined): string {
  return estado ? (ETIQUETAS_ESTADO[estado] ?? estado) : '—';
}

export function etiquetaTipo(tipo: string | null | undefined): string {
  return tipo ? (ETIQUETAS_TIPO[tipo] ?? tipo) : '—';
}

// Primera letra en mayúscula ("censo" -> "Censo", "recibida" -> "Recibida").
export function capitalizar(texto: string | null | undefined): string {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

// El backend guarda las fechas en UTC sin zona ("2026-11-10T14:00:00").
// Se marcan como UTC para que el navegador las pase a la hora local.
export function aFecha(iso: string | null | undefined): Date | null {
  if (!iso) {
    return null;
  }
  const tieneZona = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  const fecha = new Date(tieneZona ? iso : iso + 'Z');
  return isNaN(fecha.getTime()) ? null : fecha;
}

export type EstiloFecha = 'completa' | 'corta' | 'dia';

const OPCIONES: Record<EstiloFecha, Intl.DateTimeFormatOptions> = {
  completa: { dateStyle: 'medium', timeStyle: 'short' },
  corta: { day: 'numeric', month: 'short' },
  dia: { dateStyle: 'medium' },
};

// Fecha UTC del backend en hora local de Colombia, en español.
export function fechaLocal(iso: string | null | undefined, estilo: EstiloFecha = 'completa'): string {
  const fecha = aFecha(iso);
  if (!fecha) {
    return iso ? iso : '—';
  }
  return fecha.toLocaleString('es-CO', OPCIONES[estilo]);
}

// Fecha de una actividad: es un día del calendario (no una hora UTC), así que
// se toma tal cual para no correrla al día anterior por la zona horaria.
export function fechaDia(iso: string | null | undefined): string {
  const partes = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!partes) {
    return iso ?? '—';
  }
  const fecha = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  return fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
