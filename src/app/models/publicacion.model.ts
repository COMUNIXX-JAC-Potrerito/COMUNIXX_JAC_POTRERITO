export interface Publicacion {
  id: number;
  categoria: string;
  titulo: string;
  contenido: string;
  fecha_evento: string | null;
  publicado_por_id: number | null;
  created_at: string;
}

export interface PublicacionCreate {
  categoria: string;
  titulo: string;
  contenido: string;
  fecha_evento?: string | null;
}

// Categorías (deben coincidir con el backend).
export const CATEGORIAS = [
  { valor: 'decision', etiqueta: 'Decisión' },
  { valor: 'actividad', etiqueta: 'Actividad' },
  { valor: 'contenido', etiqueta: 'Contenido institucional' },
];

export function etiquetaCategoria(cat: string): string {
  return CATEGORIAS.find((c) => c.valor === cat)?.etiqueta ?? cat;
}
