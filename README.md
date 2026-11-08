# CursoUAE_Dubai_Automatizacion

Automatización con **Playwright + TypeScript** para **One Million Prompters** (https://omp.dub.ai),
la plataforma de cursos de IA de Dubái. Reproduce las lecciones pendientes de un módulo a
velocidad normal, registra el progreso y envía el cuestionario final.

> **Sin suite de tests.** El servidor es de producción y responde **429 Too Many Requests**
> en cuanto recibe varias peticiones seguidas. Por eso el repo solo tiene el login y el script
> de visionado, que espera 2 minutos entre lecciones.

## Requisitos

- **Node.js 20 o superior** (probado con Node 22) y npm
- Git
- Linux, macOS o Windows. En Linux, `install:browsers` instala las dependencias del sistema
  de Chromium (puede pedir `sudo`).

## Instalación

```bash
# 1. Clonar
git clone https://github.com/ElkinDelgado25/CursoUAE_Dubai_Automatizacion.git
cd CursoUAE_Dubai_Automatizacion

# 2. Dependencias de Node
npm install

# 3. Navegador Chromium para Playwright
npm run install:browsers

# 4. Variables de entorno
cp .env.example .env
#   Edita .env y pon tu cuenta en OMP_USER_EMAIL y OMP_USER_PASSWORD

# 5. Comprobar la instalación (no hace peticiones al sitio)
npm run typecheck
```

> `.env` y `.auth/` están en `.gitignore`: tus credenciales y la cookie de sesión nunca se suben.

## Uso

```bash
# 1. Iniciar sesión una vez: guarda la sesión en .auth/user.json
npm run login

# 2. Reproducir desde esa lección hasta el final del módulo
npm run ver -- https://omp.dub.ai/module/<slug>/play/<id>
```

- `npm run login` reutiliza la sesión si tiene menos de 90 minutos, así que no repite el login.
- `npm run ver` reproduce cada video sin check a 1x y envía el progreso al terminar.
  Espera 2 minutos entre lecciones y, ante un 429 o un 502, hace un único reintento.
  Al final responde el cuestionario con las respuestas guardadas. Solo imprime el estado HTTP
  de cada envío.

## Variables de entorno

| Variable | Defecto | Uso |
|---|---|---|
| `BASE_URL` | `https://omp.dub.ai` | Sitio de destino |
| `OMP_USER_EMAIL` / `OMP_USER_PASSWORD` | vacío | Tu cuenta, para `npm run login` |
| `PW_WORKERS` | `2` | Workers de Playwright (`1` recomendado) |

## Scripts

| Script | Qué hace |
|---|---|
| `npm run install:browsers` | Instala Chromium |
| `npm run login` | Inicia sesión y guarda `.auth/user.json` |
| `npm run ver -- <url>` | Ve las lecciones pendientes de un módulo |
| `npm run codegen` | Graba pasos nuevos contra el sitio |
| `npm run typecheck` | `tsc --noEmit` |

## Estructura

```
playwright.config.ts     Solo el proyecto `setup` (login)
src/
  components/            Header y Footer
  pages/                 Page Objects (login, módulos, reproductor de lecciones…)
  fixtures/              `test` extendido con los Page Objects
  data/                  Catálogo de módulos y textos por idioma
  utils/                 env, gotoWithRetry, intercepción de formularios
tests/
  setup/auth.setup.ts    Login único -> .auth/user.json
tools/
  ver-pendientes.mjs     Visionado de lecciones pendientes (npm run ver)
  registrar-progreso.js  Snippet de consola antiguo (obsoleto)
```
