import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ModuleInfo } from '../data/modules';

/**
 * Reproductor de lecciones (/module/:slug/play/:lessonId).
 * Video HTML5 con Plyr + HLS (Cloudflare Stream). El progreso se guarda con
 * POST /set-watch-history/:lessonId. La página no lo envía al terminar (bug):
 * `submitWatchHistory` lo manda desde el flujo de visionado.
 */
export class LessonPlayerPage extends BasePage {
  path = '/my-modules';

  readonly breadcrumb: Locator;
  readonly player: Locator;
  readonly video: Locator;
  readonly playButton: Locator;
  readonly curriculumItems: Locator;
  readonly activeItem: Locator;
  readonly lessonTitles: Locator;
  readonly sections: Locator;
  readonly progressBar: Locator;
  readonly progressBox: Locator;
  readonly watchHistoryForm: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumb = page.locator('ol.breadcrumb');
    this.player = page.locator('.plyr').first();
    this.video = page.locator('.plyr video').first();
    this.playButton = page.locator('.plyr button[data-plyr="play"]').first();
    // "coourse" es el nombre real de la clase en el sitio (errata incluida)
    this.curriculumItems = page.locator('li.coourse-playlist-item');
    this.activeItem = this.curriculumItems.and(page.locator('.active'));
    this.lessonTitles = page.locator('li.coourse-playlist-item a.video-title');
    this.sections = page.locator('.accordion-item');
    this.progressBox = page.locator('.single-progress');
    this.progressBar = this.progressBox.locator('.progress-bar');
    this.watchHistoryForm = page.locator('form[action*="/set-watch-history/"]');
  }

  /** Ruta de "continuar donde lo dejaste" (redirige a la última lección vista). */
  resumePath(module: ModuleInfo) {
    return `/module/${module.slug}/play`;
  }

  lessonPath(module: ModuleInfo, lessonId: number) {
    return `/module/${module.slug}/play/${lessonId}`;
  }

  forLesson(module: ModuleInfo, lessonId: number) {
    this.path = this.lessonPath(module, lessonId);
    return this;
  }

  /**
   * Lecciones en video sin el check (círculo vacío). El cuestionario no entra.
   * Completada: i.fa-circle-check. Pendiente: i.fa-circle.
   */
  async pendingVideoLessonIds(): Promise<number[]> {
    return this.curriculumItems.evaluateAll((items) =>
      items.flatMap((li) => {
        if (li.querySelector('i.fa-circle-check')) return [];
        if (li.querySelector('i.fa-list-check')) return [];
        if (!li.querySelector('i.fa-circle')) return [];
        const href = li.querySelector('a.video-title')?.getAttribute('href') ?? '';
        const id = Number(href.split('/').pop());
        return Number.isFinite(id) ? [id] : [];
      }),
    );
  }

  /** Lee "13/19" del bloque de progreso. */
  async progressCounts() {
    const text = await this.progressBox.innerText();
    const [, done, total] = text.match(/(\d+)\s*\/\s*(\d+)/) ?? [];
    return { done: Number(done), total: Number(total) };
  }

  /** Ancho de la barra de progreso en % (atributo style). */
  async progressBarWidth(): Promise<number> {
    const style = (await this.progressBar.getAttribute('style')) ?? '';
    return Number(style.match(/width:\s*([\d.]+)%/)?.[1] ?? NaN);
  }

  /** Espera a que el <video> tenga metadatos (duración conocida). */
  async waitForVideoReady(timeout = 60_000) {
    await this.video.evaluate(
      (v: HTMLVideoElement, ms) =>
        new Promise<void>((resolve, reject) => {
          if (v.readyState >= 1 && v.duration > 0) return resolve();
          const t = setTimeout(() => reject(new Error('El video no cargó metadatos')), ms);
          v.addEventListener('loadedmetadata', () => { clearTimeout(t); resolve(); }, { once: true });
        }),
      timeout,
    );
  }

  /** Duración mostrada en el temario para la lección activa ("00:01:35" -> 95 s). */
  async listedDurationSeconds(): Promise<number> {
    const text = await this.activeItem.innerText();
    const [h, m, sec] = (text.match(/(\d{2}):(\d{2}):(\d{2})/) ?? []).slice(1).map(Number);
    return h * 3600 + m * 60 + sec;
  }

  videoState() {
    return this.video.evaluate((v: HTMLVideoElement) => ({
      duration: v.duration,
      currentTime: v.currentTime,
      paused: v.paused,
      ended: v.ended,
      playbackRate: v.playbackRate,
      readyState: v.readyState,
    }));
  }

  /** Pulsa play en cuanto el video está listo y lo deja a velocidad 1x. */
  async playAtNormalSpeed() {
    await this.waitForVideoReady();
    await this.video.evaluate((v: HTMLVideoElement) => {
      v.playbackRate = 1;
    });
    if ((await this.videoState()).paused) await this.playButton.click();
    await this.video.evaluate((v: HTMLVideoElement) => {
      v.playbackRate = 1;
    });
  }

  /**
   * Espera a que el video llegue al final a velocidad normal.
   * No vuelve a pulsar play ni recarga nada: una sola reproducción.
   */
  async waitUntilEnded() {
    const { duration } = await this.videoState();
    const limit = duration * 1000 + 90_000;
    const started = Date.now();

    while (Date.now() - started < limit) {
      const state = await this.videoState();
      if (state.ended) return;
      if (state.playbackRate !== 1) {
        await this.video.evaluate((v: HTMLVideoElement) => {
          v.playbackRate = 1;
        });
      }
      await this.page.waitForTimeout(2_000);
    }
    throw new Error('El video no terminó a velocidad normal');
  }

  /**
   * POST /set-watch-history de la lección abierta. La página no lo dispara
   * al evento `ended`; esto lo envía con la sesión y el CSRF del formulario.
   */
  async submitWatchHistory() {
    return this.page.evaluate(async () => {
      const form = document.getElementById('watch_history_form') as HTMLFormElement | null;
      const video = document.querySelector('.plyr video, #player') as HTMLVideoElement | null;
      if (!form || !video) throw new Error('No está el formulario de progreso o el video');
      const lessonId = form.action.split('/').pop() ?? '';
      const lessonInput = form.querySelector('input[name="lesson_id"]') as HTMLInputElement | null;
      if (lessonInput) lessonInput.value = lessonId;
      const fd = new FormData(form);
      fd.set('lesson_id', lessonId);
      fd.set('progress', '100');
      fd.set('current_time', String(Math.floor(video.duration)));
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
      const response = await fetch(form.action, {
        method: 'POST',
        body: fd,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json',
          'X-CSRF-TOKEN': token,
        },
      });
      const body = await response.json().catch(() => ({} as { message?: string }));
      return { status: response.status, message: body.message ?? '' };
    });
  }
}
