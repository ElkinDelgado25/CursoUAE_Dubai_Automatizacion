import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Perfil del alumno (/profile). El formulario se envía con _method (spoofing de Laravel). */
export class ProfilePage extends BasePage {
  readonly path = '/profile';

  readonly form: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly nationality: Locator;
  readonly dateOfBirth: Locator;
  readonly residency: Locator;
  readonly city: Locator;
  readonly organization: Locator;
  readonly jobTitle: Locator;
  readonly promptingExperience: Locator;
  readonly gender: Locator;
  readonly website: Locator;
  readonly facebook: Locator;
  readonly twitter: Locator;
  readonly linkedin: Locator;
  readonly biography: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form[action$="/profile"]');
    this.firstName = this.form.locator('#first_name');
    this.lastName = this.form.locator('#last_name');
    this.email = this.form.locator('#email');
    this.phone = this.form.locator('#phone');
    this.nationality = this.form.locator('#nationality');
    this.dateOfBirth = this.form.locator('#date_of_birth');
    this.residency = this.form.locator('#residency');
    this.city = this.form.locator('#city');
    this.organization = this.form.locator('#organization');
    this.jobTitle = this.form.locator('#job_title');
    this.promptingExperience = this.form.locator('select[name="prompting_experience"]');
    this.gender = this.form.locator('select[name="gender"]');
    this.website = this.form.locator('#website');
    this.facebook = this.form.locator('#facebook');
    this.twitter = this.form.locator('#twitter');
    this.linkedin = this.form.locator('#linkedin');
    this.biography = this.form.locator('#biography');
    // El botón no tiene atributo type (submit implícito)
    this.submitButton = this.form.locator('button:not([type="button"])');
  }

  get requiredFields(): Locator[] {
    return [
      this.firstName, this.lastName, this.email, this.nationality, this.dateOfBirth, this.residency,
      this.city, this.organization, this.jobTitle, this.promptingExperience, this.gender,
    ];
  }

  get optionalFields(): Locator[] {
    return [this.phone, this.website, this.facebook, this.twitter, this.linkedin, this.biography];
  }
}
