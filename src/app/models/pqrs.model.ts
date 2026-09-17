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
  respuesta?: string | null;
  adjunto_url?: string | null;
  adjunto_tipo?: string | null;
  adjunto_nombre?: string | null;
}

// Datos que se envían al radicar una PQRS (POST /api/pqrs).
export interface PqrsCreate {
  tipo: string;
  asunto: string;
  descripcion: string;
  es_anonima: boolean;
  nombre_contacto?: string | null;
  email_contacto?: string | null;
  telefono_contacto?: string | null;
  adjunto_url?: string | null;
  adjunto_tipo?: string | null;
  adjunto_nombre?: string | null;
}

// Respuesta pública de la consulta por código (GET /api/pqrs/seguimiento/{codigo}).
export interface PqrsSeguimiento {
  codigo_seguimiento: string;
  tipo: string;
  asunto: string;
  estado: string;
  comite: string | null;
  created_at: string;
  updated_at: string | null;
  respuesta?: string | null;
  adjunto_url?: string | null;
  adjunto_tipo?: string | null;
  adjunto_nombre?: string | null;
}

// Datos del registro de usuario (POST /api/register).
export interface RegistroData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
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

// Tipos de PQRS válidos (debe coincidir con el backend).
export const TIPOS: string[] = ['Peticion', 'Queja', 'Reclamo', 'Sugerencia'];
