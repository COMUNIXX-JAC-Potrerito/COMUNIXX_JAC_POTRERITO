import { leerPayload, tokenVencido } from './auth.service';

// Arma un JWT de prueba (sin firma real: el frontend no la verifica).
function token(payload: object): string {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const base64 = btoa(String.fromCharCode(...json))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `cabecera.${base64}.firma`;
}

describe('tokens de sesión', () => {
  const ahora = Date.UTC(2026, 10, 10, 12, 0, 0);

  it('un token con exp en el futuro sigue vigente', () => {
    expect(tokenVencido(token({ exp: ahora / 1000 + 60 }), ahora)).toBeFalse();
  });

  it('un token con exp en el pasado está vencido', () => {
    expect(tokenVencido(token({ exp: ahora / 1000 - 1 }), ahora)).toBeTrue();
  });

  it('un token sin exp o ilegible cuenta como vencido', () => {
    expect(tokenVencido(token({ sub: 'a@b.co' }), ahora)).toBeTrue();
    expect(tokenVencido('basura', ahora)).toBeTrue();
  });

  it('lee bien los datos con tildes (UTF-8)', () => {
    expect(leerPayload(token({ sub: 'josé@vereda.co', role: 'administrador' }))?.['sub']).toBe('josé@vereda.co');
  });
});
