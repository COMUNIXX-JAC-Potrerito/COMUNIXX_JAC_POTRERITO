import { aFecha, capitalizar, etiquetaEstado, etiquetaTipo, fechaDia, fechaLocal } from './formato';

describe('formato', () => {
  it('muestra los estados con espacios en vez de guion bajo', () => {
    expect(etiquetaEstado('En_Proceso')).toBe('En proceso');
    expect(etiquetaEstado('En_Espera')).toBe('En espera');
    expect(etiquetaEstado('Finalizada')).toBe('Finalizada');
    expect(etiquetaEstado(null)).toBe('—');
  });

  it('muestra "Petición" con tilde', () => {
    expect(etiquetaTipo('Peticion')).toBe('Petición');
    expect(etiquetaTipo('Queja')).toBe('Queja');
  });

  it('capitaliza la primera letra', () => {
    expect(capitalizar('censo')).toBe('Censo');
    expect(capitalizar('')).toBe('');
  });

  it('interpreta como UTC las fechas del backend sin zona horaria', () => {
    expect(aFecha('2026-11-10T15:00:00')?.toISOString()).toBe('2026-11-10T15:00:00.000Z');
    expect(aFecha('2026-11-10T15:00:00Z')?.toISOString()).toBe('2026-11-10T15:00:00.000Z');
    expect(aFecha('no es fecha')).toBeNull();
    expect(aFecha(null)).toBeNull();
  });

  it('formatea en español', () => {
    expect(fechaLocal('2026-11-10T15:00:00', 'dia')).toContain('2026');
    expect(fechaLocal(null)).toBe('—');
  });

  it('no corre la fecha de una actividad al día anterior', () => {
    expect(fechaDia('2026-11-20T00:00:00')).toContain('20');
    expect(fechaDia('2026-11-20T00:00:00')).toContain('noviembre');
  });
});
