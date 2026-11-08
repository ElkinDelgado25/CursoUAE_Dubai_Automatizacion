import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { retryStaticAssets } from '../utils/network';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ContactPage,
  ForgotPasswordPage,
  ModulesPage,
  ModuleDetailPage,
  MyModulesPage,
  ProfilePage,
  PasswordPage,
  LessonPlayerPage,
} from '../pages';

interface PageFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  contactPage: ContactPage;
  forgotPasswordPage: ForgotPasswordPage;
  modulesPage: ModulesPage;
  moduleDetailPage: ModuleDetailPage;
  myModulesPage: MyModulesPage;
  profilePage: ProfilePage;
  passwordPage: PasswordPage;
  lessonPlayerPage: LessonPlayerPage;
  /** Constructor de análisis axe preconfigurado (WCAG 2.1 A/AA). */
  makeAxe: () => AxeBuilder;
  /** Errores JS no capturados de la página durante el test. */
  pageErrors: Error[];
  /** Estáticos que dieron 5xx y se reintentaron (se anotan en el reporte). */
  flakyAssets: string[];
}

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  contactPage: async ({ page }, use) => use(new ContactPage(page)),
  forgotPasswordPage: async ({ page }, use) => use(new ForgotPasswordPage(page)),
  modulesPage: async ({ page }, use) => use(new ModulesPage(page)),
  moduleDetailPage: async ({ page }, use) => use(new ModuleDetailPage(page)),
  myModulesPage: async ({ page }, use) => use(new MyModulesPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),
  passwordPage: async ({ page }, use) => use(new PasswordPage(page)),
  lessonPlayerPage: async ({ page }, use) => use(new LessonPlayerPage(page)),

  makeAxe: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']));
  },

  flakyAssets: [
    async ({ page }, use, testInfo) => {
      const flaky = await retryStaticAssets(page);
      await use(flaky);
      if (flaky.length) {
        testInfo.annotations.push({ type: 'flaky-assets', description: `${flaky.length} estáticos con 5xx reintentados` });
      }
    },
    { auto: true },
  ],

  pageErrors: async ({ page }, use) => {
    const errors: Error[] = [];
    page.on('pageerror', (e) => errors.push(e));
    await use(errors);
  },
});

export { expect };
