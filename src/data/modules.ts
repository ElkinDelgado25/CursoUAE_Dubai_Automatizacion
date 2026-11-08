export interface ModuleInfo {
  number: number;
  title: string;
  slug: string;
  /** Palabra que debe encontrar el buscador de /modules. */
  searchTerm: string;
}

/** Catálogo público actual de omp.dub.ai (actualizar si el sitio cambia). */
export const MODULES: ModuleInfo[] = [
  { number: 1, title: 'Unleashing the Power of AI', slug: 'unleashing-the-power-of-ai-1', searchTerm: 'Unleashing' },
  { number: 2, title: 'Commanding Conversations with AI Chatbots', slug: 'commanding-conversations-with-ai-chatbots-2', searchTerm: 'chatbot' },
  { number: 3, title: 'AI-Powered Productivity Revolution', slug: 'ai-powered-productivity-revolution-3', searchTerm: 'Productivity' },
  { number: 4, title: 'Creative Frontiers with Generative AI', slug: 'creative-frontiers-with-generative-ai-4', searchTerm: 'Creative' },
];

export const CATEGORIES = [{ name: 'Prompt Engineering', slug: 'prompt-engineering' }];

export const modulePath = (m: ModuleInfo) => `/module/${m.slug}`;

/** Lecciones del Módulo 1 (ids reales de /play/:id). La 46 es el cuestionario final. */
export const MODULE_1_LESSON_IDS = [...Array.from({ length: 18 }, (_, i) => i + 1), 46];
export const MODULE_1_QUIZ_ID = 46;
/** Lecciones en video del Módulo 1 (sin el cuestionario). */
export const MODULE_1_VIDEO_LESSON_IDS = MODULE_1_LESSON_IDS.filter((id) => id !== MODULE_1_QUIZ_ID);
