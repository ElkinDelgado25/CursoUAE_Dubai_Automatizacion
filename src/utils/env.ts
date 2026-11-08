import 'dotenv/config';
import path from 'node:path';

const bool = (v: string | undefined) => v === '1' || v?.toLowerCase() === 'true';

export const env = {
  baseURL: process.env.BASE_URL ?? 'https://omp.dub.ai',
  isCI: bool(process.env.CI),
  workers: Number(process.env.PW_WORKERS ?? 2),
  allBrowsers: bool(process.env.ALL_BROWSERS),

  /** Credenciales de una cuenta de prueba (opcional). Sin ellas, los tests @auth se omiten. */
  userEmail: process.env.OMP_USER_EMAIL ?? '',
  userPassword: process.env.OMP_USER_PASSWORD ?? '',

  /** Permite enviar al servidor el login con credenciales inválidas (POST real). */
  allowServerSubmits: bool(process.env.ALLOW_SERVER_SUBMITS),
} as const;

export const hasCredentials = () => Boolean(env.userEmail && env.userPassword);

export const STORAGE_STATE = path.join(__dirname, '../../.auth/user.json');
