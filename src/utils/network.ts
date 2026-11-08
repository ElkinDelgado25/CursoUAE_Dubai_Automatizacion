import type { Page, Request } from '@playwright/test';

export interface CapturedSubmit {
  url: string;
  method: string;
  /** Campos del formulario enviado (application/x-www-form-urlencoded). */
  fields: Record<string, string>;
}

/**
 * Intercepta los POST a una ruta y los aborta, guardando el payload.
 * Así validamos que el formulario envía los datos correctos sin crear
 * registros reales (usuarios, mensajes de contacto) en producción.
 */
export async function blockFormSubmit(page: Page, pathPattern: string | RegExp) {
  const captured: CapturedSubmit[] = [];
  const matcher = typeof pathPattern === 'string' ? `**${pathPattern}` : pathPattern;

  await page.route(matcher, async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.fallback();
    captured.push(parseSubmit(request));
    await route.abort('aborted');
  });

  return {
    captured,
    /** Espera hasta que se haya capturado al menos un envío. */
    async waitForSubmit(timeout = 15_000): Promise<CapturedSubmit> {
      const start = Date.now();
      while (captured.length === 0) {
        if (Date.now() - start > timeout) throw new Error(`No se envió ningún POST a ${pathPattern}`);
        await page.waitForTimeout(100);
      }
      return captured[0];
    },
  };
}

function parseSubmit(request: Request): CapturedSubmit {
  const fields: Record<string, string> = {};
  const body = request.postData() ?? '';
  for (const [k, v] of new URLSearchParams(body)) fields[k] = v;
  return { url: request.url(), method: request.method(), fields };
}

/**
 * Aborta TODA petición que modifique datos (POST/PUT/PATCH/DELETE) y la registra.
 * Úsalo en los tests con sesión real: protege el progreso del curso
 * (POST /set-watch-history/:id), el perfil, la contraseña y el logout.
 */
export async function blockMutations(page: Page) {
  const blocked: CapturedSubmit[] = [];
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) {
      blocked.push(parseSubmit(request));
      return route.abort('aborted');
    }
    return route.fallback();
  });
  return blocked;
}

/**
 * omp.dub.ai devuelve 502 en archivos estáticos (/assets, /uploads) cuando está saturado,
 * y entonces no cargan jQuery, Plyr ni hls.js. Reintenta esas peticiones (hasta 3 veces)
 * para que los tests prueben la funcionalidad, y devuelve cuántas fallaron al primer intento.
 */
export async function retryStaticAssets(page: Page, attempts = 3) {
  const flaky: string[] = [];
  await page.route(/\/(assets|uploads)\//, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    for (let i = 1; i <= attempts; i++) {
      try {
        const response = await route.fetch();
        if (response.status() < 500 || i === attempts) return route.fulfill({ response });
        flaky.push(`${response.status()} ${route.request().url()}`);
      } catch {
        if (i === attempts) return route.abort('failed');
      }
      await new Promise((r) => setTimeout(r, 1_000 * i));
    }
  });
  return flaky;
}
