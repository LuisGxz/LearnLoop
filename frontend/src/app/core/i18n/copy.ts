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

  // ── Catalog ──────────────────────────────────────────────────────────
  'catalog.heroEyebrow': { en: 'Learn by doing', es: 'Aprende haciendo' },
  'catalog.heroTitle': { en: 'Build real skills, one loop at a time.', es: 'Aprende de verdad, un loop a la vez.' },
  'catalog.heroBody': { en: 'Courses with lessons, auto-graded quizzes, progress, streaks and badges.', es: 'Cursos con lecciones, quizzes auto-calificados, progreso, rachas e insignias.' },
  'catalog.title': { en: 'Explore courses', es: 'Explora cursos' },
  'catalog.subtitle': { en: 'Pick a course and start a loop — watch, practice, quiz, repeat.', es: 'Elige un curso y arranca un loop — mira, practica, responde, repite.' },
  'catalog.continueLearning': { en: 'Keep going', es: 'Sigue aprendiendo' },
  'catalog.empty.title': { en: 'No courses yet', es: 'Aún no hay cursos' },
  'catalog.empty.body': { en: 'New courses will show up here as instructors publish them.', es: 'Los cursos nuevos aparecerán aquí cuando los instructores los publiquen.' },
  'catalog.badge.new': { en: 'New', es: 'Nuevo' },
  'catalog.badge.done': { en: 'Done', es: 'Completado' },
  'catalog.continue': { en: 'Continue', es: 'Continuar' },
  'catalog.lessons': { en: 'lessons', es: 'lecciones' },
  'catalog.modules': { en: 'modules', es: 'módulos' },

  // ── Stats strip ──────────────────────────────────────────────────────
  'stats.greeting': { en: 'Pick up where you left off', es: 'Sigue donde lo dejaste' },
  'stats.greetingNew': { en: 'Welcome', es: 'Bienvenido' },
  'stats.streak': { en: 'Day streak', es: 'Racha de días' },
  'stats.xp': { en: 'Total XP', es: 'XP total' },
  'stats.enrolled': { en: 'Enrolled', es: 'Inscrito' },
  'stats.avgProgress': { en: 'Avg. progress', es: 'Progreso medio' },
} as const;

export type CopyKey = keyof typeof COPY;
