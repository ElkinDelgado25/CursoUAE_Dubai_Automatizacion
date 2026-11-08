import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ModuleInfo } from '../data/modules';

export class ModuleDetailPage extends BasePage {
  path: string;

  readonly title: Locator;
  readonly enrollButton: Locator;
  readonly overviewHeading: Locator;
  readonly curriculumHeading: Locator;
  readonly lessonLinks: Locator;
  readonly shareLinks: Locator;
  readonly videoPlayer: Locator;

  constructor(page: Page, module?: ModuleInfo) {
    super(page);
    this.path = module ? `/module/${module.slug}` : '/modules';
    this.title = page.getByRole('heading', { level: 2 }).first();
    this.enrollButton = page.getByRole('link', { name: 'Enroll Now' });
    this.overviewHeading = page.getByRole('heading', { level: 4, name: 'Module Overview' });
    this.curriculumHeading = page.getByRole('heading', { level: 4, name: 'Module Curriculum' });
    this.lessonLinks = page.locator('a[href*="/play/"]');
    this.shareLinks = page.locator(
      'a[href*="facebook.com/sharer"], a[href*="twitter.com/intent"], a[href*="api.whatsapp.com"], a[href*="linkedin.com/shareArticle"]',
    );
    this.videoPlayer = page.locator('.plyr').first();
  }

  forModule(module: ModuleInfo) {
    this.path = `/module/${module.slug}`;
    return this;
  }
}
