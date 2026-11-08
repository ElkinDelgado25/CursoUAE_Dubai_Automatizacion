import type { Page, Response } from '@playwright/test';

export interface GotoOptions {
  /** Intentos ante 5xx o timeout. */
  attempts?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  timeout?: number;
}

/**
 * page.goto con reintentos: omp.dub.ai a veces responde 502 Bad Gateway
 * o tarda más que el timeout. Reintenta solo errores de infraestructura,
 * nunca 4xx (esos son fallos reales que el test debe ver).
 */
export async function gotoWithRetry(
  page: Page,
  url: string,
  { attempts = 3, waitUntil = 'domcontentloaded', timeout }: GotoOptions = {},
): Promise<Response | null> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const response = await page.goto(url, { waitUntil, timeout });
      if (response && response.status() >= 500 && i < attempts) {
        lastError = new Error(`HTTP ${response.status()} en ${url}`);
        await page.waitForTimeout(2_000 * i);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      // Con el servidor lento, las cadenas de redirección (p. ej. /login -> /dashboard -> /my-modules)
      // a veces abortan la navegación aunque la página termine cargando el destino.
      if (String(error).includes('ERR_ABORTED')) {
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        if (!page.url().startsWith('about:') && !page.url().startsWith('chrome-error:')) return null;
      }
      if (i === attempts) break;
      await page.waitForTimeout(2_000 * i);
    }
  }
  throw lastError;
}
