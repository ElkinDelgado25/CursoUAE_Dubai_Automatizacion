import { test as base, expect } from './index';
import { hasCredentials, STORAGE_STATE } from '../utils/env';
import { blockMutations, type CapturedSubmit } from '../utils/network';

/**
 * `test` para la zona del alumno (sesión real):
 *  - usa la sesión guardada por tests/setup/auth.setup.ts
 *  - se omite si no hay OMP_USER_EMAIL / OMP_USER_PASSWORD
 *  - bloquea AUTOMÁTICAMENTE todo POST/PUT/PATCH/DELETE: ningún test puede
 *    cambiar el progreso del curso, el perfil, la contraseña ni cerrar la sesión.
 */
export const test = base.extend<{ blockedMutations: CapturedSubmit[] }>({
  storageState: async ({}, use) => use(STORAGE_STATE),

  blockedMutations: [
    async ({ page }, use) => {
      await use(await blockMutations(page));
    },
    { auto: true },
  ],
});

test.beforeEach(() => {
  test.skip(!hasCredentials(), 'Configura OMP_USER_EMAIL / OMP_USER_PASSWORD en .env');
});

export { expect };
