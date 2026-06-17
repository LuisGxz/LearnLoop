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

  // ── Course / lesson view ─────────────────────────────────────────────
  'course.back': { en: 'Back to courses', es: 'Volver a cursos' },
  'course.by': { en: 'by', es: 'por' },
  'course.lesson': { en: 'Lesson', es: 'Lección' },
  'course.module': { en: 'Module', es: 'Módulo' },
  'course.enrollCta': { en: 'Enroll — start learning', es: 'Inscríbete — empieza a aprender' },
  'course.enrollHint': { en: 'Enroll to track progress, earn XP and unlock your certificate.', es: 'Inscríbete para seguir tu progreso, ganar XP y desbloquear tu certificado.' },
  'course.signInToEnroll': { en: 'Sign in to enroll', es: 'Entra para inscribirte' },
  'course.complete': { en: 'Complete', es: 'Completar' },
  'course.completed': { en: 'Completed', es: 'Completada' },
  'course.watching': { en: 'watching now', es: 'viendo ahora' },
  'course.takeQuiz': { en: 'Take the quiz', es: 'Hacer el quiz' },
  'course.quizPassed': { en: 'Quiz passed', es: 'Quiz aprobado' },
  'course.courseDone': { en: 'Course complete!', es: '¡Curso completado!' },
  'course.viewCertificate': { en: 'View certificate', es: 'Ver certificado' },
  'course.lessonType.video': { en: 'Video', es: 'Video' },
  'course.lessonType.text': { en: 'Reading', es: 'Lectura' },
  'course.nextUp': { en: 'Next up', es: 'Siguiente' },
  'course.xpEarned': { en: 'XP earned', es: 'XP ganado' },

  // ── Quiz / achievement ───────────────────────────────────────────────
  'quiz.question': { en: 'Question', es: 'Pregunta' },
  'quiz.of': { en: 'of', es: 'de' },
  'quiz.check': { en: 'Check answer', es: 'Comprobar' },
  'quiz.next': { en: 'Next question', es: 'Siguiente pregunta' },
  'quiz.finish': { en: 'See results', es: 'Ver resultados' },
  'quiz.correct': { en: 'Correct!', es: '¡Correcto!' },
  'quiz.incorrect': { en: 'Not quite', es: 'Casi' },
  'quiz.complete': { en: 'Quiz complete!', es: '¡Quiz completado!' },
  'quiz.passedMsg': { en: 'You passed — keep the loop going.', es: 'Aprobaste — sigue el loop.' },
  'quiz.failedMsg': { en: 'Review the lesson and try again.', es: 'Repasa la lección e inténtalo de nuevo.' },
  'quiz.retry': { en: 'Try again', es: 'Reintentar' },
  'quiz.backToCourse': { en: 'Back to course', es: 'Volver al curso' },
  'quiz.newBadge': { en: 'new badge', es: 'insignia nueva' },
  'quiz.streak': { en: 'streak', es: 'racha' },
  'quiz.correctCount': { en: 'correct', es: 'correctas' },
  'quiz.start': { en: 'Start quiz', es: 'Comenzar quiz' },
  'quiz.intro': { en: 'Answer each question, get instant feedback, and earn XP for what you get right.', es: 'Responde cada pregunta, recibe feedback al instante y gana XP por tus aciertos.' },
  'quiz.questions': { en: 'questions', es: 'preguntas' },
  'quiz.passingScore': { en: 'to pass', es: 'para aprobar' },

  // ── Certificate ──────────────────────────────────────────────────────
  'cert.title': { en: 'Certificate of completion', es: 'Certificado de finalización' },
  'cert.awardedTo': { en: 'This certifies that', es: 'Se certifica que' },
  'cert.completed': { en: 'has successfully completed', es: 'ha completado con éxito' },
  'cert.issued': { en: 'Issued', es: 'Emitido' },
  'cert.instructor': { en: 'Instructor', es: 'Instructor' },
  'cert.download': { en: 'Print / save as PDF', es: 'Imprimir / guardar PDF' },

  // ── Stats strip ──────────────────────────────────────────────────────
  'stats.greeting': { en: 'Pick up where you left off', es: 'Sigue donde lo dejaste' },
  'stats.greetingNew': { en: 'Welcome', es: 'Bienvenido' },
  'stats.streak': { en: 'Day streak', es: 'Racha de días' },
  'stats.xp': { en: 'Total XP', es: 'XP total' },
  'stats.enrolled': { en: 'Enrolled', es: 'Inscrito' },
  'stats.avgProgress': { en: 'Avg. progress', es: 'Progreso medio' },
} as const;

export type CopyKey = keyof typeof COPY;
