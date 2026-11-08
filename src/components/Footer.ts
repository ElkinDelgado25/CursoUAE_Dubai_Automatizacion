import type { Locator, Page } from '@playwright/test';

export class Footer {
  readonly root: Locator;
  readonly contactLink: Locator;

  constructor(page: Page) {
    this.root = page.locator('footer');
    this.contactLink = this.root.locator('a[href$="/contact-us"]');
  }
}
