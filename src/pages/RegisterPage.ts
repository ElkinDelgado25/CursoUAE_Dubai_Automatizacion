import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { RegisterData } from '../data/factories';

export class RegisterPage extends BasePage {
  readonly path = '/register';

  readonly heading: Locator;
  readonly form: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly password: Locator;
  readonly passwordConfirmation: Locator;
  readonly nationality: Locator;
  readonly dateOfBirth: Locator;
  readonly residency: Locator;
  readonly city: Locator;
  readonly organization: Locator;
  readonly jobTitle: Locator;
  readonly promptingExperience: Locator;
  readonly gender: Locator;
  readonly terms: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form[action$="/register"]');
    this.heading = page.locator('h4').first();
    this.firstName = this.form.locator('#first_name');
    this.lastName = this.form.locator('#last_name');
    this.email = this.form.locator('#email');
    this.phone = this.form.locator('#phone');
    this.password = this.form.locator('#password');
    this.passwordConfirmation = this.form.locator('#password_confirmation');
    this.nationality = this.form.locator('#nationality');
    this.dateOfBirth = this.form.locator('#date_of_birth');
    this.residency = this.form.locator('#residency');
    this.city = this.form.locator('#city');
    this.organization = this.form.locator('#organization');
    this.jobTitle = this.form.locator('#job_title');
    // Estos dos <select> no tienen id: se localizan por name
    this.promptingExperience = this.form.locator('select[name="prompting_experience"]');
    this.gender = this.form.locator('select[name="gender"]');
    this.terms = this.form.locator('#terms');
    this.submitButton = this.form.locator('button[type="submit"]');
  }

  /** Todos los campos obligatorios del formulario (atributo required). */
  get requiredFields(): Locator[] {
    return [
      this.firstName, this.lastName, this.email, this.phone, this.password, this.passwordConfirmation,
      this.nationality, this.dateOfBirth, this.residency, this.city, this.organization, this.jobTitle,
      this.promptingExperience, this.gender, this.terms,
    ];
  }

  async fillForm(data: RegisterData) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.phone.fill(data.phone);
    await this.password.fill(data.password);
    await this.passwordConfirmation.fill(data.passwordConfirmation);
    await this.nationality.selectOption({ label: data.nationality });
    await this.dateOfBirth.fill(data.dateOfBirth);
    await this.residency.selectOption({ label: data.residency });
    await this.city.fill(data.city);
    await this.organization.fill(data.organization);
    await this.jobTitle.fill(data.jobTitle);
    await this.promptingExperience.selectOption({ label: data.promptingExperience });
    await this.gender.selectOption({ label: data.gender });
    await this.terms.setChecked(data.acceptTerms);
  }

  async submit() {
    await this.submitButton.click();
  }
}
