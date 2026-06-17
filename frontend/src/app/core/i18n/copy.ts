// Hand-rolled EN/ES dictionary (no ngx-translate). Each key maps to both
// languages; screens extend this object as they land. Keep keys grouped by area.
export type Lang = 'en' | 'es';

export const COPY = {
  // ── Brand / header / nav ─────────────────────────────────────────────
  'brand.tagline': { en: 'Learn by doing', es: 'Aprende haciendo' },
  'nav.catalog': { en: 'Courses', es: 'Cursos' },
  'nav.myLearning': { en: 'My learning', es: 'Mi aprendizaje' },
  'nav.teach': { en: 'Teach', es: 'Enseñar' },
  'nav.about': { en: 'About', es: 'Acerca de' },
  'nav.signIn': { en: 'Sign in', es: 'Entrar' },
  'nav.signOut': { en: 'Sign out', es: 'Salir' },
  'chip.streak': { en: 'day streak', es: 'días de racha' },
  'chip.xp': { en: 'XP', es: 'XP' },
  'role.instructor': { en: 'Instructor', es: 'Instructor' },
  'role.student': { en: 'Student', es: 'Estudiante' },

  // ── Shared states ────────────────────────────────────────────────────
  'state.loading': { en: 'Loading…', es: 'Cargando…' },
  'state.empty.title': { en: 'Nothing here yet', es: 'Aún no hay nada' },
  'state.empty.body': { en: 'Come back once there is something to show.', es: 'Vuelve cuando haya algo que mostrar.' },
  'state.error.title': { en: 'Something went wrong', es: 'Algo salió mal' },
  'state.error.retry': { en: 'Try again', es: 'Reintentar' },
  'state.offline': { en: "Can't reach the server. Check your connection and try again.", es: 'No se pudo conectar al servidor. Revisa tu conexión e inténtalo de nuevo.' },

  // ── Common actions ───────────────────────────────────────────────────
  'action.continue': { en: 'Continue', es: 'Continuar' },
  'action.start': { en: 'Start', es: 'Comenzar' },
  'action.save': { en: 'Save', es: 'Guardar' },
  'action.cancel': { en: 'Cancel', es: 'Cancelar' },
} as const;

export type CopyKey = keyof typeof COPY;
