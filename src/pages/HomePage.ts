import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly path = '/';

  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly watchVideoButton: Locator;
  readonly promoVideoModal: Locator;
  readonly promoVideoIframe: Locator;
  readonly promoVideoClose: Locator;
  readonly courseSummaryHeading: Locator;
  readonly learningOutcomesHeading: Locator;
  readonly contentPartnerHeading: Locator;
  readonly moduleTitles: Locator;
  readonly moduleLinks: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heroTitle = page.getByRole('heading', { level: 1, name: 'One Million Prompters' });
    this.heroSubtitle = page.getByRole('heading', { name: 'Boost your knowledge in prompt engineering' }).first();
    this.watchVideoButton = page.locator('button.watch-video');
    this.promoVideoModal = page.locator('#promoVideo');
    this.promoVideoIframe = page.locator('#promoVideoPlayer');
    this.promoVideoClose = this.promoVideoModal.locator('button.video_close');
    this.courseSummaryHeading = page.getByRole('heading', { level: 2, name: 'Course Summary' });
    this.learningOutcomesHeading = page.getByRole('heading', { level: 2, name: 'Learning Outcomes' });
    this.contentPartnerHeading = page.getByRole('heading', { level: 2, name: 'Content Partner' });
    this.moduleTitles = page.locator('h4').filter({ hasNot: page.locator('a') });
    this.moduleLinks = page.locator('a[href*="/module/"]');
    this.signUpButton = page.getByRole('button', { name: 'Sign up Now' });
  }

  outcome(name: string): Locator {
    return this.page.getByRole('heading', { level: 4, name });
  }

  async openPromoVideo() {
    await this.watchVideoButton.click();
    await this.promoVideoModal.waitFor({ state: 'visible' });
  }
}
