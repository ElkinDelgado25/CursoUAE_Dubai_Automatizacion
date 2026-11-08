import { defineConfig } from '@playwright/test';
import { env } from './src/utils/env';

/**
 * Harness Playwright para https://omp.dub.ai (One Million Prompters).
 *
 * El servidor es lento (respuestas de 15-40 s) y a veces devuelve 502,
 * por eso los timeouts son amplios y el número de workers es bajo:
 * no queremos saturar un sitio de producción.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  forbidOnly: env.isCI,
  retries: 0,
  workers: env.workers,
  timeout: 180_000,
  expect: { timeout: 20_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: env.baseURL,
    navigationTimeout: 90_000,
    // Un clic espera la navegación que provoca: con este servidor puede superar 1 min
    actionTimeout: 90_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'Asia/Dubai',
    ignoreHTTPSErrors: false,
  },

  // Solo el login: no hay suite de tests para no provocar 429 (Too Many Requests) en producción.
  projects: [
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
    },
  ],
});
