import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { ContactData } from '../data/factories';

export class ContactPage extends BasePage {
  readonly path = '/contact-us';

  readonly heading: Locator;
  readonly form: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly message: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form[action$="/contact-us"]');
    this.heading = page.locator('h4').first();
    this.name = this.form.locator('#name');
    this.email = this.form.locator('#email');
    this.phone = this.form.locator('#phone');
    this.message = this.form.locator('textarea[name="message"]');
    this.submitButton = this.form.locator('button[type="submit"]');
  }

  async fillForm(data: ContactData) {
    await this.name.fill(data.name);
    await this.email.fill(data.email);
    await this.phone.fill(data.phone);
    await this.message.fill(data.message);
  }

  async submit() {
    await this.submitButton.click();
  }
}
