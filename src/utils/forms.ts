import type { Locator } from '@playwright/test';

/** Mensaje de validación nativa HTML5 del navegador ("" si el campo es válido). */
export const validationMessage = (field: Locator) =>
  field.evaluate((el) => (el as HTMLInputElement).validationMessage);

export const isValid = (field: Locator) =>
  field.evaluate((el) => (el as HTMLInputElement).checkValidity());

/** ¿El formulario completo pasa la validación nativa? */
export const formIsValid = (form: Locator) =>
  form.evaluate((el) => (el as HTMLFormElement).checkValidity());
