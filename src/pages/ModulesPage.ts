import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ModulesPage extends BasePage {
  readonly path = '/modules';

  readonly allModulesHeading: Locator;
  readonly categoriesHeading: Locator;
  readonly categoryLinks: Locator;
  readonly cards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.allModulesHeading = page.getByRole('heading', { level: 3, name: 'All Modules' });
    this.categoriesHeading = page.getByRole('heading', { level: 4, name: 'Categories' });
    this.categoryLinks = page.locator('a[href*="/modules/"]');
    this.cards = page.locator('a.card[href*="/module/"]');
    this.emptyState = page.getByText('No data found !');
  }

  card(title: string): Locator {
    return this.cards.filter({ has: this.page.getByRole('heading', { level: 3, name: title, exact: true }) });
  }

  async cardTitles(): Promise<string[]> {
    return this.cards.locator('h3').allInnerTexts().then((t) => t.map((s) => s.trim()));
  }

  async search(term: string) {
    return this.goto({ search: term });
  }

  async openModule(title: string) {
    await Promise.all([this.page.waitForURL(/\/module\//), this.card(title).click()]);
  }
}
