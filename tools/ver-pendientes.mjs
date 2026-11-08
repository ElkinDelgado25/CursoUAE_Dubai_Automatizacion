/**
 * Ve solo las lecciones en video sin check. No es un test: no hace login,
 * no corre el setup y no reintenta estáticos.
 *
 * Por lección: una carga, play a velocidad normal, un POST al terminar.
 * Si ese POST responde 429, espera 2 minutos sin más peticiones y lo reintenta una vez.
 * Entre lección y lección espera 2 minutos.
 *
 * Uso: npm run ver -- https://omp.dub.ai/module/<slug>/play/<id>
 * Desde esa lección hasta el final del módulo. Al terminar los videos envía el cuestionario.
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base = process.env.BASE_URL ?? 'https://omp.dub.ai';
const inicio = new URL(process.argv[2] ?? `${base}/module/unleashing-the-power-of-ai-1/play/1`);
const moduleSlug = inicio.pathname.match(/\/module\/([^/]+)\//)?.[1];
const desdeId = Number(inicio.pathname.match(/\/play\/(\d+)/)?.[1] ?? 0);
const pausaMs = 2 * 60 * 1000;
if (!moduleSlug) throw new Error('Pasa la URL de la lección: /module/<slug>/play/<id>');

function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[¿?¡!"“”'']/g, '').replace(/\s+/g, ' ').trim();
}

/** Respuesta correcta por enunciado, ya normalizado. */
const respuestas = new Map([
  ['¿Cuál de las siguientes describe mejor a la IA?', 'Un programa de software que puede aprender de los datos'],
  ['¿Cuáles de las siguientes son aplicaciones reales de la IA?', 'Todas las anteriores'],
  ['¿Cuáles son las 2 etapas del ciclo de vida de la IA?', 'Entrenamiento e inferencia'],
  ['¿Cómo se llama a un sistema de IA experto en una tarea en particular?', 'IA específica'],
  ['Ordena estas 3 disciplinas de menor a mayor:', 'Aprendizaje profundo < Aprendizaje automático < IA'],
  ['¿Qué es la Prueba de Turing?', 'Una prueba para determinar si un programa de IA puede pensar, hablar o comportarse como un humano'],
  ['que es la ia generativa?', 'IA que puede crear contenido nuevo, como texto, imágenes, música, video'],
  ['que significa llm?', 'Modelo de Lenguaje Grande'],
  ['cual es la principal diferencia entre los chatbots de ia y los motores de busqueda?', 'Prestan atención al contexto'],
  ['que es un prompt?', 'El texto que introduces a un chatbot de IA'],
  ['cuales son los 3 pasos principales de un buen prompt en el orden correcto?', 'Rol - Contexto - Tarea'],
  ['que son las "alucinaciones" en ia?', 'Cuando los chatbots dan respuestas erróneas o inventadas'],
  ['cual es el enfoque recomendado al dar instrucciones a la ia?', 'Rol-Contexto-Tarea'],
  ['cual es una gran limitacion para los textos generados por ia?', 'Puede contener errores y requiere revisión'],
  ['al usar ia para ventas y marketing, que se puede especificar para alterar el tono del contenido generado?', 'Configuración de tono como entusiasta o casual'],
  ['cual es un beneficio del uso de ia en reclutamiento de rrhh?', 'La IA puede analizar múltiples CVs y extraer experiencia relevante'],
  ['que herramienta de ia puede usarse para crear graficos promocionales para una campana en redes sociales?', 'Todas las anteriores'],
  ['por que es importante no compartir documentos confidenciales con herramientas gratuitas como chatgpt?', 'No garantizan privacidad y los datos pueden ser absorbidos'],
  ['que debes recordar siempre al usar ia para tareas laborales?', 'La IA ahorra tiempo, pero siempre revisa su trabajo'],
  ['que herramientas de ia son las principales candidatas para generar imagenes a partir de texto?', 'DALL-E / Midjourney / Stable Diffusion / Dream / Imagine / Party'],
  ['que herramienta de ia fue desarrollada por openai para generar imagenes?', 'DALL-E'],
  ['que factor mejora en gran medida los resultados al usar midjourney?', 'Prompts más detallados y descriptivos'],
  ['que puedes lograr con dall-e en el navegador edge con copilot?', 'Obtener algunas imágenes gratis pero con límite y más lentas'],
  ['que plataforma de las siguientes puede generar musica con ia?', 'Suno'],
  ['que caracteristica clave ofrece midjourney para aumentar la resolucion de una imagen generada?', 'Botones de aumento de resolución'],
  ['cual de las siguientes herramientas de ia se utiliza para generar video a partir de texto?', 'Runway ML'],
  ['como se describe la ia en este curso?', 'Un software que aprende'],
  ['cual de los siguientes es un ejemplo de ia especifica (narrow ai)?', 'Todas las anteriores'],
  ['cual es el proposito de la prueba de turing?', 'Ver si una IA puede engañar a un humano haciéndole creer que también es humano'],
  ['cual de los siguientes es un chatbot de ia generativa popular?', 'ChatGPT'],
  ['cual es la regla general para crear un buen prompt?', 'Rol/ Contexto / Tarea'],
  ['cual es un ejemplo de una alucinacion en ia?', 'Que la IA dé una respuesta equivocada o inventada'],
  ['como se puede usar la ia para analisis de datos?', 'Explorando y visualizando datos en hojas de Excel'],
  ['que herramienta de ia esta integrada en aplicaciones de microsoft office como word y powerpoint?', 'Copilot'],
  ['cual de las siguientes afirmaciones es verdadera respecto a la ia y el trabajo?', 'Los humanos que usen IA serán más productivos'],
  ['que herramienta de ia permite la creacion de videos a partir de texto?', 'Runway ML'],
  ['que funcion ofrece midjourney al ajustar la creacion de imagenes?', 'Cambiar la relación de aspecto y la cantidad de imágenes generadas'],
].map(([enunciado, valor]) => [normalizar(enunciado), valor]));

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({
  storageState: path.join(root, '.auth/user.json'),
})).newPage();

await page.route('**/*', (route) => {
  const req = route.request();
  const url = req.url();
  if (req.resourceType() === 'image' || req.resourceType() === 'font' || url.endsWith('.map')) return route.abort();
  if (/googletagmanager|google-analytics|facebook\.net|hotjar|doubleclick|fonts\.gstatic/.test(url)) return route.abort();
  return route.continue();
});

function planDesde(items, minId) {
  return items.flatMap((li) => {
    const href = li.querySelector('a.video-title')?.getAttribute('href') ?? '';
    const id = Number(href.split('/').pop());
    if (!Number.isFinite(id) || id < minId) return [];
    const quiz = Boolean(li.querySelector('i.fa-list-check'));
    const hecho = Boolean(li.querySelector('i.fa-circle-check'));
    return [{ id, quiz, hecho }];
  });
}

async function abrir(url) {
  console.log(`[ver] GET ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  } catch (error) {
    if (!String(error).includes('Timeout')) throw error;
    console.log('[ver] La página no respondió. Un solo reintento tras 2 min.');
    await page.waitForTimeout(pausaMs);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  }
}

const temario = page.locator('li.coourse-playlist-item');
await abrir(inicio.href);
if ((await temario.count()) === 0) {
  console.log('[ver] Temario vacío. Un solo reintento tras 2 min.');
  await page.waitForTimeout(pausaMs);
  await abrir(inicio.href);
}
if ((await temario.count()) === 0) throw new Error('El temario no cargó');

const plan = await temario.evaluateAll(planDesde, desdeId);
const cuestionarios = plan.filter((item) => item.quiz && !item.hecho);
const pendientes = plan.filter((item) => !item.quiz && !item.hecho).map((item) => item.id);
console.log(`[ver] Cuestionario al final: ${cuestionarios.map((item) => item.id).join(', ') || 'ninguno'}`);
console.log(`[ver] Videos desde ${desdeId}: ${pendientes.join(', ') || 'ninguno'}`);

for (let i = 0; i < pendientes.length; i++) {
  const id = pendientes[i];
  const url = `${base}/module/${moduleSlug}/play/${id}`;
  if (!page.url().endsWith(`/play/${id}`)) await abrir(url);

  const videoListo = () => page.locator('.plyr video, #player').first().evaluate((v) => v.readyState >= 1 && v.duration > 0).catch(() => false);
  let video = page.locator('.plyr video, #player').first();
  const esperarVideo = async () => {
    const hasta = Date.now() + 90_000;
    while (Date.now() < hasta) {
      if (await videoListo()) return true;
      await page.waitForTimeout(2_000);
    }
    return false;
  };
  if (!(await esperarVideo())) {
    console.log(`[ver] Lección ${id}: el video no cargó. Un solo reintento tras 2 min.`);
    await page.waitForTimeout(pausaMs);
    await abrir(url);
    video = page.locator('.plyr video, #player').first();
    if (!(await esperarVideo())) throw new Error(`La lección ${id} no cargó el video`);
  }
  await video.evaluate((v) => { v.playbackRate = 1; });
  if (await video.evaluate((v) => v.paused)) {
    await page.locator('.plyr button[data-plyr="play"]').first().click();
  }

  const duration = await video.evaluate((v) => v.duration);
  const limite = Date.now() + duration * 1000 + 90_000;
  while (Date.now() < limite) {
    const fin = await video.evaluate((v) => {
      if (v.playbackRate !== 1) v.playbackRate = 1;
      return v.ended;
    });
    if (fin) break;
    await page.waitForTimeout(2_000);
  }
  if (!(await video.evaluate((v) => v.ended))) throw new Error(`La lección ${id} no terminó`);

  const enviar = () => page.evaluate(async () => {
    const form = document.getElementById('watch_history_form');
    const v = document.querySelector('.plyr video, #player');
    const lessonId = form.action.split('/').pop();
    const lessonInput = form.querySelector('input[name="lesson_id"]');
    if (lessonInput) lessonInput.value = lessonId;
    const fd = new FormData(form);
    fd.set('lesson_id', lessonId);
    fd.set('progress', '100');
    fd.set('current_time', String(Math.floor(v.duration)));
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const response = await fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json', 'X-CSRF-TOKEN': token },
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, message: body.message ?? '' };
  });

  let sent = await enviar();
  if (sent.status === 429 || sent.status === 502) {
    console.log(`[ver] Lección ${id}: HTTP ${sent.status}. 2 min sin peticiones y un solo reintento.`);
    await page.waitForTimeout(pausaMs);
    sent = await enviar();
  }
  console.log(`[ver] Lección ${id}: HTTP ${sent.status} ${sent.message}`);
  const yaGuardado = sent.status === 403 && /mayor o igual/i.test(sent.message);
  if (!yaGuardado && (sent.status < 200 || sent.status >= 300)) {
    throw new Error(`Lección ${id}: HTTP ${sent.status} ${sent.message}`);
  }

  if (i < pendientes.length - 1 || cuestionarios.length) await page.waitForTimeout(pausaMs);
}

for (const quiz of cuestionarios) {
  const quizUrl = `${base}/module/${moduleSlug}/play/${quiz.id}`;
  if (!page.url().includes(`/play/${quiz.id}`)) await abrir(quizUrl);
  const preguntas = await page.locator('form.quiz-submit-form .question').evaluateAll((nodes) => nodes.map((nodo) => ({
    enunciado: nodo.querySelector('.main-title p')?.textContent?.trim() ?? '',
    opciones: [...nodo.querySelectorAll('input')].map((input) => input.value),
  })));
  const elegidas = [];
  for (const pregunta of preguntas) {
    const valor = respuestas.get(normalizar(pregunta.enunciado));
    if (!valor || !pregunta.opciones.includes(valor)) {
      throw new Error(`Sin respuesta guardada para: ${pregunta.enunciado}`);
    }
    elegidas.push(valor);
  }
  await page.locator('form.quiz-submit-form input[type=checkbox]').evaluateAll((inputs, valores) => {
    for (const input of inputs) input.checked = valores.includes(input.value);
  }, elegidas);
  console.log(`[ver] Cuestionario ${quiz.id}: ${elegidas.length} respuestas marcadas`);
  const enviarQuiz = () => page.evaluate(async (valores) => {
    const form = document.querySelector('form.quiz-submit-form');
    if (!form) throw new Error('No está el formulario del cuestionario');
    for (const input of form.querySelectorAll('input[type=checkbox]')) input.checked = valores.includes(input.value);
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'text/html', 'X-CSRF-TOKEN': token },
    });
    return { status: response.status };
  }, elegidas);
  let enviado = await enviarQuiz();
  if (enviado.status === 429 || enviado.status === 502) {
    console.log(`[ver] Cuestionario ${quiz.id}: HTTP ${enviado.status}. 2 min sin recargar y un solo reintento.`);
    await page.waitForTimeout(pausaMs);
    enviado = await enviarQuiz();
  }
  console.log(`[ver] Cuestionario ${quiz.id}: HTTP ${enviado.status}`);
  if (enviado.status < 200 || enviado.status >= 300) {
    throw new Error(`Cuestionario ${quiz.id}: HTTP ${enviado.status}`);
  }
}

await browser.close();
console.log('[ver] Listo.');
