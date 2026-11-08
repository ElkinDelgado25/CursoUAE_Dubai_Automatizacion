import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Cambio de contraseña (/password). */
export class PasswordPage extends BasePage {
  readonly path = '/password';

  readonly form: Locator;
  readonly currentPassword: Locator;
  readonly newPassword: Locator;
  readonly confirmPassword: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form[action$="/password"]');
    this.currentPassword = this.form.locator('#update_password_current_password');
    this.newPassword = this.form.locator('#update_password_password');
    this.confirmPassword = this.form.locator('#update_password_password_confirmation');
    // El botón no tiene atributo type (submit implícito)
    this.submitButton = this.form.locator('button:not([type="button"])');
  }

  async fill(current: string, next: string, confirm = next) {
    await this.currentPassword.fill(current);
    await this.newPassword.fill(next);
    await this.confirmPassword.fill(confirm);
  }
}
