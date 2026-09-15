// Estructura de una PQRS tal como la devuelve el backend.
export interface Pqrs {
  id: number;
  codigo_seguimiento: string;
  tipo: string;
  asunto: string;
  descripcion: string;
  estado: string;
  es_anonima: boolean;
  comite: string | null;
  radicado_por_id: number | null;
  nombre_contacto: string | null;
  email_contacto: string | null;
  telefono_contacto: string | null;
  created_at: string;
}

// Catálogo de comités/cargos válidos (debe coincidir con el backend: catalogos.py).
export const COMITES: string[] = [
  'Presidente',
  'Vicepresidente',
  'Tesorero',
  'Secretario',
  'Fiscal',
  'Comisión de Convivencia y Conciliación',
  'Comisión de Obras e Infraestructura',
  'Comisión de Deportes y Recreación',
  'Comisión de Salud',
  'Comisión de Medio Ambiente y Gestión del Riesgo',
  'Comisión de Educación y Cultura',
];

// Estados válidos del ciclo de vida de una PQRS.
export const ESTADOS: string[] = ['Nueva', 'En_Proceso', 'Finalizada'];
