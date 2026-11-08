/*
 * OBSOLETO. El visionado va en tools/ver-pendientes.mjs (npm run ver), fuera de la suite de tests.
 *
 * Registrar progreso de lección en omp.dub.ai — restaura la función que falta en la página.
 *
 * La plataforma nunca envía el POST /set-watch-history al terminar un video (bug).
 * Este snippet:
 *   - pulsa play en cuanto el video está listo
 *   - cuenta los segundos reproducidos en tiempo real (adelantar no suma)
 *   - apenas termina el video, envía el POST con progreso 100 si viste al menos el 90 %
 *   - si el servidor rechaza la actualización, lo muestra y no reintenta
 *
 * Uso: abre la lección, F12 > Console, pega este código y pulsa Enter.
 * Hay que pegarlo de nuevo en cada lección (al cambiar de página se pierde).
 */
(() => {
  const video = document.querySelector('.plyr video, #player');
  const form = document.getElementById('watch_history_form');
  if (!video || !form) return console.warn('[progreso] Abre primero una lección (/module/.../play/N).');

  const lessonId = form.action.split('/').pop();
  let watched = 0;
  let last = null;
  let sent = false;

  video.addEventListener('timeupdate', () => {
    const t = video.currentTime;
    if (last !== null && !video.paused) {
      const delta = t - last;
      if (delta > 0 && delta < 1.5) watched += delta; // los saltos por adelantar no cuentan
    }
    last = t;
  });
  video.addEventListener('seeking', () => { last = null; });

  async function enviar() {
    if (sent) return;
    const duration = video.duration;
    if (!duration) return;
    const ratio = watched / duration;
    if (ratio < 0.9) {
      return console.warn(`[progreso] Solo viste el ${(ratio * 100).toFixed(0)} % del video; no se envía nada.`);
    }
    sent = true;
    const lessonInput = form.querySelector('input[name="lesson_id"]');
    if (lessonInput) lessonInput.value = lessonId;
    const fd = new FormData(form);
    fd.set('lesson_id', lessonId);
    fd.set('progress', '100');
    fd.set('current_time', String(Math.floor(duration)));
    console.log(`[progreso] Video terminado. Enviando POST de la lección ${lessonId}…`);
    const r = await fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
    });
    const body = await r.json().catch(() => ({}));
    console.log(`[progreso] Lección ${lessonId}: HTTP ${r.status} · ${body.message ?? ''}`);
    if (r.ok) console.log('[progreso] Listo. Recarga la página para ver el ✅ y pasa a la siguiente lección.');
    else sent = false;
  }

  video.addEventListener('ended', () => { enviar(); });

  function darPlay() {
    if (!video.paused) return;
    const btn = document.querySelector('.plyr button[data-plyr="play"]');
    if (btn) btn.click();
    else video.play().catch(() => console.warn('[progreso] El navegador bloqueó el play. Pulsa ▶.'));
  }

  if (video.readyState >= 2) darPlay();
  else video.addEventListener('canplay', darPlay, { once: true });

  console.log(`[progreso] Activo para la lección ${lessonId}. Play automático; el POST sale al terminar.`);
})();
