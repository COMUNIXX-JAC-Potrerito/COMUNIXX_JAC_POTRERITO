export interface Pregunta {
  id: number;
  texto: string;
  tipo: string; // 'texto' | 'opciones'
  opciones: string[] | null;
  orden: number;
}

export interface EncuestaResumen {
  id: number;
  titulo: string;
  descripcion: string | null;
  tipo: string; // 'encuesta' | 'censo'
  publicada: boolean;
  created_at: string;
}

export interface EncuestaDetalle extends EncuestaResumen {
  preguntas: Pregunta[];
}

export interface PreguntaCreate {
  texto: string;
  tipo: string;
  opciones?: string[] | null;
}

export interface EncuestaCreate {
  titulo: string;
  descripcion?: string | null;
  tipo: string;
  preguntas: PreguntaCreate[];
}

export interface RespuestaItem {
  pregunta_id: number;
  valor: string | null;
}

export interface ResultadoPregunta {
  pregunta_id: number;
  texto: string;
  tipo: string;
  total: number;
  conteo: Record<string, number> | null;
  respuestas_texto: string[] | null;
}

export interface EncuestaResultados {
  encuesta_id: number;
  titulo: string;
  total_respuestas: number;
  preguntas: ResultadoPregunta[];
}
