/** Tipos de los datos que aceptan los formularios de registro y contacto. */

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  nationality: string;
  dateOfBirth: string; // yyyy-mm-dd
  residency: string;
  city: string;
  organization: string;
  jobTitle: string;
  promptingExperience: 'Beginner' | 'Intermediate' | 'Advanced';
  gender: 'Male' | 'Female';
  acceptTerms: boolean;
}

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
