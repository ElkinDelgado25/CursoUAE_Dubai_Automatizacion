export type LocaleCode = 'en' | 'es' | 'ar';

export interface LocaleInfo {
  code: LocaleCode;
  /** Texto del botón del selector de idioma. */
  label: string;
  dir: 'ltr' | 'rtl';
  login: { heading: string; email: string; password: string; remember: string; submit: string };
  registerHeading: string;
}

export const LOCALES: Record<LocaleCode, LocaleInfo> = {
  en: {
    code: 'en',
    label: 'English',
    dir: 'ltr',
    login: { heading: 'Login', email: 'Email Address', password: 'Password', remember: 'Remember me', submit: 'Login' },
    registerHeading: 'Register',
  },
  es: {
    code: 'es',
    label: 'español',
    dir: 'ltr',
    login: {
      heading: 'Iniciar Sesión',
      email: 'Dirección de Correo Electrónico',
      password: 'Contraseña',
      remember: 'Recordarme',
      submit: 'Iniciar Sesión',
    },
    registerHeading: 'Registrarse',
  },
  ar: {
    code: 'ar',
    label: 'العربية',
    dir: 'rtl',
    login: {
      heading: 'تسجيل الدخول',
      email: 'عنوان البريد الإلكتروني',
      password: 'كلمة المرور',
      remember: 'تذكرني',
      submit: 'تسجيل الدخول',
    },
    registerHeading: 'التسجيل',
  },
};
