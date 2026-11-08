import type { Locator, Page } from '@playwright/test';

/** Cabecera común a todas las páginas públicas. */
export class Header {
  readonly root: Locator;
  readonly logo: Locator;
  readonly primaryMenu: Locator;
  readonly loginButton: Locator;

  // Buscador (desktop: .web-form, móvil: .mob-form con botón popup)
  readonly desktopSearchInput: Locator;
  readonly desktopSearchSubmit: Locator;
  readonly mobileSearchToggle: Locator;
  readonly mobileSearchInput: Locator;
  readonly mobileSearchSubmit: Locator;

  // Selector de idioma
  readonly languageToggle: Locator;
  readonly languageOptions: Locator;

  // Menú de usuario (solo con sesión): Mis Módulos, Mi Perfil, Contraseña, Cerrar Sesión
  readonly userMenuToggle: Locator;
  readonly userMenuItems: Locator;

  // Menú lateral móvil (offcanvas)
  readonly mobileMenuToggle: Locator;
  readonly mobileMenu: Locator;
  readonly mobileMenuClose: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('header.header-area');
    this.logo = this.root.locator('.logo-image a').first();
    this.primaryMenu = this.root.locator('ul.primary-menu');
    this.loginButton = this.root.locator('a.login-web');

    this.desktopSearchInput = this.root.locator('form.web-form input[name="search"]');
    this.desktopSearchSubmit = this.root.locator('form.web-form button[type="submit"]');
    this.mobileSearchToggle = this.root.locator('form.mob-form button.btn-popup');
    this.mobileSearchInput = this.root.locator('form.mob-form input[name="search"]');
    this.mobileSearchSubmit = this.root.locator('form.mob-form button[type="submit"]');

    // Con sesión hay dos .Userprofile (idioma y avatar): el de idioma usa .btn-secondary
    const languageMenu = this.root.locator('.Userprofile').filter({ has: page.locator('button.btn-secondary') });
    this.languageToggle = languageMenu.locator('button.dropdown-toggle');
    this.languageOptions = languageMenu.locator('.dropdown-menu a.dropdown-item');

    const userMenu = this.root.locator('.Userprofile').filter({ has: page.locator('button.us-btn') });
    this.userMenuToggle = userMenu.locator('button.us-btn');
    this.userMenuItems = userMenu.locator('.dropdown-menu a.dropdown-item');

    this.mobileMenuToggle = this.root.locator('.toggle-bar');
    this.mobileMenu = page.locator('#offcanvasWithBothOptions');
    this.mobileMenuClose = this.mobileMenu.locator('button.btn-close');
  }

  navLink(name: string): Locator {
    return this.primaryMenu.getByRole('link', { name, exact: true });
  }

  mobileMenuLink(name: string): Locator {
    return this.mobileMenu.getByRole('link', { name, exact: true });
  }

  async search(term: string) {
    if (await this.desktopSearchInput.isVisible()) {
      await this.desktopSearchInput.fill(term);
      await Promise.all([this.page.waitForURL(/\/modules\?search=/), this.desktopSearchInput.press('Enter')]);
    } else {
      await this.mobileSearchToggle.click();
      await this.mobileSearchInput.fill(term);
      await Promise.all([this.page.waitForURL(/\/modules\?search=/), this.mobileSearchSubmit.click()]);
    }
  }

  async openLanguageMenu() {
    await this.languageToggle.click();
  }

  /** Cambia el idioma desde el dropdown (texto visible: "English", "español", "العربية"). */
  async switchLanguage(label: string) {
    await this.openLanguageMenu();
    const option = this.languageOptions.filter({ hasText: label });
    await Promise.all([this.page.waitForURL(/locale=/), option.click()]);
  }

  async openUserMenu() {
    await this.userMenuToggle.click();
    await this.userMenuItems.first().waitFor({ state: 'visible' });
  }

  async openMobileMenu() {
    await this.mobileMenuToggle.click();
    await this.mobileMenu.waitFor({ state: 'visible' });
  }
}
