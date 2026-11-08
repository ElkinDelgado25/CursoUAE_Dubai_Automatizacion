import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  readonly path = '/forgot-password';

  readonly heading: Locator;
  readonly form: Locator;
  readonly email: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form[action$="/forgot-password"]');
    this.heading = page.locator('h4').first();
    this.email = this.form.locator('#email');
    this.submitButton = this.form.locator('button[type="submit"]');
  }

  async requestReset(email: string) {
    await this.email.fill(email);
    await this.submitButton.click();
  }
}
