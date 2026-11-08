import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/login';

  readonly heading: Locator;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMe: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  /** Errores de validación de Laravel / toasts de la app. */
  readonly errors: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form.login-form[action$="/login"]');
    this.heading = page.locator('h4').first();
    this.emailInput = this.form.locator('#email');
    this.passwordInput = this.form.locator('#password');
    this.rememberMe = this.form.locator('#remember_me');
    this.submitButton = this.form.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('a.login-url[href$="/forgot-password"]');
    this.registerLink = page.locator('a.login-url[href$="/register"]');
    this.errors = page.locator('.invalid-feedback, .text-danger, .alert-danger, .toast-body, [role="alert"]');
  }

  async fill(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * El POST /login de omp.dub.ai puede tardar más de 2 minutos: el click espera
   * la navegación resultante, así que su timeout es configurable.
   */
  async login(email: string, password: string, { timeout = 240_000 } = {}) {
    await this.fill(email, password);
    await this.submitButton.click({ timeout });
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }
}
