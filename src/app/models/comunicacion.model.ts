export interface Mensaje {
  id: number;
  remitente_id: number;
  destinatario_id: number;
  asunto: string;
  contenido: string;
  leido: boolean;
  created_at: string;
}

export interface MensajeCreate {
  destinatario_id: number;
  asunto: string;
  contenido: string;
}

export interface Comunicacion {
  id: number;
  tipo: string; // enviada, recibida
  entidad: string;
  asunto: string;
  descripcion: string | null;
  fecha: string;
  registrado_por_id: number | null;
  created_at: string;
}

export interface ComunicacionCreate {
  tipo: string;
  entidad: string;
  asunto: string;
  descripcion?: string | null;
}

export interface Usuario {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
}

export interface Reporte {
  usuarios: number;
  pqrs_total: number;
  pqrs_nuevas: number;
  pqrs_en_proceso: number;
  pqrs_finalizadas: number;
  publicaciones: number;
  comunicaciones_enviadas: number;
  comunicaciones_recibidas: number;
  mensajes_internos: number;
}
