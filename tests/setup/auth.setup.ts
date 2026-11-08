import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '../../src/fixtures';
import { env, hasCredentials, STORAGE_STATE } from '../../src/utils/env';

/**
 * Inicia sesión una sola vez y guarda la sesión en .auth/user.json.
 * tools/ver-pendientes.mjs (npm run ver) la reutiliza.
 * Sin OMP_USER_EMAIL / OMP_USER_PASSWORD se escribe una sesión vacía.
 */
setup('autenticar usuario de prueba', async ({ page, loginPage }) => {
  setup.setTimeout(360_000);
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

  if (!hasCredentials()) {
    fs.writeFileSync(STORAGE_STATE, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip(true, 'Sin credenciales en .env: se omite el login real');
  }

  // Reutiliza la sesión si es reciente (la cookie de sesión de Laravel dura 2 h)
  const maxAgeMs = 90 * 60 * 1000;
  if (fs.existsSync(STORAGE_STATE) && Date.now() - fs.statSync(STORAGE_STATE).mtimeMs < maxAgeMs) {
    const state = JSON.parse(fs.readFileSync(STORAGE_STATE, 'utf8'));
    if (state.cookies?.length) setup.skip(true, 'Sesión reciente en .auth/user.json: se reutiliza');
  }

  await loginPage.goto();
  await loginPage.login(env.userEmail, env.userPassword);
  // Tras el login la app redirige a /my-modules (el POST puede tardar >2 min)
  await expect(page).toHaveURL(/\/my-modules/, { timeout: 240_000 });
  await page.context().storageState({ path: STORAGE_STATE });
});
