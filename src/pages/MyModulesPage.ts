import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Panel del alumno (/my-modules). Selectores independientes del idioma. */
export class MyModulesPage extends BasePage {
  readonly path = '/my-modules';

  readonly userName: Locator;
  readonly userEmail: Locator;
  /** Tarjeta "Mis Módulos": "<inscritos>/<total>". */
  readonly enrolledStat: Locator;
  /** Tarjeta "Progreso Total": "<n>%". */
  readonly totalProgressStat: Locator;
  readonly moduleCards: Locator;
  readonly sidebarSearch: Locator;

  constructor(page: Page) {
    super(page);
    this.userName = page.locator('.profile-info-banner h5.first_name');
    this.userEmail = page.locator('.profile-info-banner p.email');
    const stats = page.locator('.profile-progress .p-card');
    this.enrolledStat = stats.nth(0).locator('h3 + div');
    this.totalProgressStat = stats.nth(1).locator('h3 + div');
    this.moduleCards = page.locator('section a[href*="/module/"][href$="/play"]');
    this.sidebarSearch = page.locator('form.filter-from input[name="search"]');
  }

  /** Devuelve { enrolled, total } a partir del texto "1/4". */
  async enrolledCounts() {
    const [enrolled, total] = (await this.enrolledStat.innerText()).replace(/\s/g, '').split('/').map(Number);
    return { enrolled, total };
  }

  async totalProgress(): Promise<number> {
    return Number((await this.totalProgressStat.innerText()).replace(/[^\d.]/g, ''));
  }

  cardFor(slug: string): Locator {
    return this.page.locator(`section a[href$="/module/${slug}/play"]`);
  }
}
