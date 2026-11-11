import { Pqrs } from '../../models/pqrs.model';
import {
  calcularIndicadores,
  cargaPorComite,
  contarPorEstado,
  contarPorTipo,
  filtrarPorPeriodo,
  formatoDuracion,
  formatoPorcentaje,
  maximoEje,
  mediana,
  radicadasPorMes,
} from './estadisticas';

let siguienteId = 1;
function pqrs(datos: Partial<Pqrs>): Pqrs {
  return {
    id: siguienteId++,
    codigo_seguimiento: 'abc',
    tipo: 'Queja',
    asunto: 'x',
    descripcion: 'x',
    estado: 'Nueva',
    es_anonima: false,
    comite: null,
    radicado_por_id: null,
    nombre_contacto: null,
    email_contacto: null,
    telefono_contacto: null,
    created_at: '2026-11-01T12:00:00',
    respuestas: [],
    ...datos,
  };
}

describe('estadísticas del tablero', () => {
  const ahora = new Date(2026, 10, 15); // 15 de noviembre de 2026 (hora local)

  it('calcula los indicadores principales', () => {
    const lista = [
      pqrs({ estado: 'Finalizada', comite: 'Fiscal' }),
      pqrs({ estado: 'En_Proceso', comite: 'Fiscal', es_anonima: true }),
      pqrs({ estado: 'Nueva' }),
      pqrs({ estado: 'Nueva' }),
    ];
    const k = calcularIndicadores(lista);
    expect(k.total).toBe(4);
    expect(k.finalizadas).toBe(1);
    expect(k.pendientes).toBe(3);
    expect(k.tasaResolucion).toBe(0.25);
    expect(k.sinAsignar).toBe(2);
    expect(k.anonimas).toBe(1);
    expect(k.sinRespuesta).toBe(3);
  });

  it('sin PQRS no inventa porcentajes ni tiempos', () => {
    const k = calcularIndicadores([]);
    expect(k.tasaResolucion).toBeNull();
    expect(k.medianaPrimeraRespuestaHoras).toBeNull();
  });

  it('mide la primera respuesta (hilo nuevo y respuesta antigua)', () => {
    const lista = [
      pqrs({
        created_at: '2026-11-01T10:00:00',
        respuestas: [
          { id: 2, texto: 'b', created_at: '2026-11-01T20:00:00' },
          { id: 1, texto: 'a', created_at: '2026-11-01T12:00:00' },
        ],
      }),
      pqrs({ created_at: '2026-11-02T10:00:00', respuesta: 'vieja', respuesta_fecha: '2026-11-02T16:00:00' }),
      pqrs({ created_at: '2026-11-03T10:00:00' }), // sin respuesta: no cuenta
    ];
    // 2 h y 6 h -> mediana 4 h
    expect(calcularIndicadores(lista).medianaPrimeraRespuestaHoras).toBe(4);
  });

  it('cuenta por estado y por tipo en el orden fijo del catálogo', () => {
    const lista = [pqrs({ estado: 'Finalizada', tipo: 'Peticion' }), pqrs({ estado: 'En_Espera' })];
    expect(contarPorEstado(lista).map((c) => c.clave)).toEqual(['Nueva', 'En_Proceso', 'En_Espera', 'Finalizada']);
    expect(contarPorEstado(lista).map((c) => c.cantidad)).toEqual([0, 0, 1, 1]);
    expect(contarPorTipo(lista).find((c) => c.clave === 'Peticion')?.cantidad).toBe(1);
  });

  it('filtra por periodo contando el mes en curso', () => {
    const lista = [
      pqrs({ created_at: '2026-11-10T12:00:00' }),
      pqrs({ created_at: '2026-09-02T12:00:00' }),
      pqrs({ created_at: '2026-05-10T12:00:00' }),
    ];
    expect(filtrarPorPeriodo(lista, '3m', ahora).length).toBe(2); // sep, oct, nov
    expect(filtrarPorPeriodo(lista, '12m', ahora).length).toBe(3);
    expect(filtrarPorPeriodo(lista, 'todo', ahora).length).toBe(3);
  });

  it('incluye los meses sin PQRS en la serie mensual', () => {
    const lista = [pqrs({ created_at: '2026-11-10T12:00:00' }), pqrs({ created_at: '2026-09-10T12:00:00' })];
    const meses = radicadasPorMes(lista, '3m', ahora);
    expect(meses.map((m) => m.clave)).toEqual(['2026-09', '2026-10', '2026-11']);
    expect(meses.map((m) => m.total)).toEqual([1, 0, 1]);
  });

  it('en "Todo" la serie empieza en el mes de la primera PQRS', () => {
    const meses = radicadasPorMes([pqrs({ created_at: '2026-08-10T12:00:00' })], 'todo', ahora);
    expect(meses[0].clave).toBe('2026-08');
    expect(meses.length).toBe(4);
  });

  it('ordena la carga por comité de más a menos pendientes', () => {
    const lista = [
      pqrs({ comite: 'Fiscal', estado: 'Finalizada' }),
      pqrs({ comite: 'Tesorero', estado: 'En_Proceso' }),
      pqrs({ comite: 'Tesorero', estado: 'En_Espera' }),
      pqrs({ comite: 'Comité inventado', estado: 'Nueva' }), // fuera del catálogo: se ignora
    ];
    const carga = cargaPorComite(lista);
    expect(carga.map((c) => c.comite)).toEqual(['Tesorero', 'Fiscal']);
    expect(carga[0]).toEqual(
      jasmine.objectContaining({ enProceso: 1, porAtender: 1, finalizadas: 0, total: 2, pendientes: 2 }),
    );
  });

  it('da límites de eje redondos y pares', () => {
    expect(maximoEje(0)).toBe(4);
    expect(maximoEje(3)).toBe(4);
    expect(maximoEje(7)).toBe(10);
    expect(maximoEje(13)).toBe(20);
    expect(maximoEje(51)).toBe(100);
  });

  it('formatea duraciones y porcentajes', () => {
    expect(formatoDuracion(null)).toBe('—');
    expect(formatoDuracion(0.25)).toBe('15 min');
    expect(formatoDuracion(5)).toBe('5 h');
    expect(formatoDuracion(60)).toBe('2,5 días');
    expect(formatoPorcentaje(0.756)).toBe('76 %');
    expect(mediana([3, 1, 2])).toBe(2);
  });
});
