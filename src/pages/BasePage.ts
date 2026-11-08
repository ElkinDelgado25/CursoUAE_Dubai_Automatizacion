import type { Page, Response } from '@playwright/test';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { gotoWithRetry, type GotoOptions } from '../utils/navigation';

export abstract class BasePage {
  /** Ruta relativa a baseURL (p. ej. "/login"). */
  abstract readonly path: string;

  readonly header: Header;
  readonly footer: Footer;

  constructor(readonly page: Page) {
    this.header = new Header(page);
    this.footer = new Footer(page);
  }

  async goto(query?: Record<string, string>, options?: GotoOptions): Promise<Response | null> {
    const qs = query ? `?${new URLSearchParams(query)}` : '';
    return gotoWithRetry(this.page, this.path + qs, options);
  }

  async htmlLang() {
    return this.page.locator('html').getAttribute('lang');
  }

  async htmlDir() {
    return this.page.locator('html').getAttribute('dir');
  }
}
