import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LanguageService } from '../core/i18n/language.service';

interface Pattern {
  area: string;
  areaEs: string;
  how: string;
  howEs: string;
}

/** Public, bilingual project deep-dive — FinPulse-parity /about page. */
@Component({
  selector: 'll-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <article class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <!-- Lead -->
      <p class="font-mono text-xs uppercase tracking-widest text-grow-600">
        {{ es() ? 'Acerca del proyecto' : 'About this project' }}
      </p>
      <h1 class="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">LearnLoop</h1>
      <p class="mt-4 text-lg text-ink-600">
        {{
          es()
            ? 'Una plataforma de aprendizaje (LMS) con gamificación: cursos con módulos y lecciones, quizzes auto-calificados, progreso por lección, XP, rachas, insignias y certificados. Construida para demostrar un stack full-stack Java + Angular de calidad de producción.'
            : 'A gamified learning platform (LMS): courses with modules and lessons, auto-graded quizzes, per-lesson progress, XP, streaks, badges and certificates. Built to showcase a production-grade Java + Angular full-stack.'
        }}
      </p>

      <div class="mt-5 flex flex-wrap gap-2">
        @for (chip of chips; track chip) {
          <span class="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-extrabold text-ink-600">{{ chip }}</span>
        }
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <a routerLink="/" class="inline-flex items-center gap-2 rounded-full bg-grow-600 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-grow-500">
          <lucide-icon name="book-open" class="h-4 w-4" />{{ es() ? 'Explorar cursos' : 'Explore courses' }}
        </a>
        <a routerLink="/login" class="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm font-extrabold text-ink-900 transition-colors hover:border-grow-600">
          {{ es() ? 'Probar la demo' : 'Try the demo' }}
        </a>
      </div>

      <!-- Demo credentials -->
      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        @for (c of creds; track c.email) {
          <div class="rounded-2xl border border-ink-200 bg-white p-4">
            <p class="flex items-center gap-2 text-sm font-extrabold">
              <lucide-icon [name]="c.icon" class="h-4 w-4 text-grow-600" />{{ es() ? c.roleEs : c.role }}
            </p>
            <p class="num mt-1 text-xs text-ink-600">{{ c.email }}</p>
            <p class="num text-xs text-ink-400">Demo1234!</p>
          </div>
        }
      </div>

      <!-- Sections -->
      @for (s of sections(); track s.title) {
        <section class="mt-10">
          <h2 class="flex items-center gap-2 text-xl font-extrabold">
            <lucide-icon [name]="s.icon" class="h-5 w-5 text-grow-600" />{{ s.title }}
          </h2>
          @for (p of s.body; track p) {
            <p class="mt-3 text-ink-600">{{ p }}</p>
          }
          @if (s.bullets) {
            <ul class="mt-3 space-y-2">
              @for (b of s.bullets; track b) {
                <li class="flex gap-2 text-ink-600">
                  <lucide-icon name="check" class="mt-1 h-4 w-4 shrink-0 text-grow-600" /><span>{{ b }}</span>
                </li>
              }
            </ul>
          }
        </section>
      }

      <!-- Architecture diagram -->
      <section class="mt-10">
        <h2 class="flex items-center gap-2 text-xl font-extrabold">
          <lucide-icon name="infinity" class="h-5 w-5 text-grow-600" />{{ es() ? 'Arquitectura' : 'Architecture' }}
        </h2>
        <div class="mt-4 overflow-x-auto rounded-2xl border border-ink-200 bg-ink-900 p-5">
          <pre class="text-xs leading-relaxed text-grow-100"><code>{{ diagram }}</code></pre>
        </div>
      </section>

      <!-- Patterns table -->
      <section class="mt-10">
        <h2 class="flex items-center gap-2 text-xl font-extrabold">
          <lucide-icon name="sparkles" class="h-5 w-5 text-grow-600" />{{ es() ? 'Patrones aplicados' : 'Patterns applied' }}
        </h2>
        <div class="mt-4 overflow-hidden rounded-2xl border border-ink-200">
          <table class="w-full text-left text-sm">
            <thead class="bg-ink-100 text-xs font-extrabold uppercase tracking-wide text-ink-600">
              <tr>
                <th class="px-4 py-3">{{ es() ? 'Área' : 'Area' }}</th>
                <th class="px-4 py-3">{{ es() ? 'Cómo' : 'How' }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of patterns; track row.area) {
                <tr class="border-t border-ink-200 align-top">
                  <td class="px-4 py-3 font-extrabold">{{ es() ? row.areaEs : row.area }}</td>
                  <td class="px-4 py-3 text-ink-600">{{ es() ? row.howEs : row.how }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Trade-offs -->
      <section class="mt-10">
        <h2 class="flex items-center gap-2 text-xl font-extrabold">
          <lucide-icon name="flag" class="h-5 w-5 text-grow-600" />{{ es() ? 'Decisiones y trade-offs' : 'Decisions & trade-offs' }}
        </h2>
        <ul class="mt-3 space-y-2">
          @for (t of tradeoffs(); track t) {
            <li class="flex gap-2 text-ink-600">
              <lucide-icon name="arrow-left" class="mt-1 h-4 w-4 shrink-0 rotate-180 text-grow-600" /><span>{{ t }}</span>
            </li>
          }
        </ul>
      </section>

      <p class="mt-10 border-t border-ink-200 pt-6 text-sm text-ink-400">
        {{ es() ? 'Más detalle técnico en' : 'More technical detail in' }}
        <code class="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">docs/TECHNICAL.md</code>.
      </p>
    </article>
  `,
})
export class About {
  private readonly i18n = inject(LanguageService);
  protected readonly es = this.i18n.isSpanish;

  protected readonly chips = [
    'Angular 20', 'Spring Boot 3.5', 'Java 21', 'Spring Security + JWT', 'JPA / Hibernate',
    'MySQL', 'Tailwind v4', 'RBAC', 'EN / ES',
  ];

  protected readonly creds = [
    { role: 'Student', roleEs: 'Estudiante', email: 'student@learnloop.dev', icon: 'graduation-cap' },
    { role: 'Instructor', roleEs: 'Instructor', email: 'instructor@learnloop.dev', icon: 'pencil' },
  ];

  protected readonly diagram = `Angular 20 (standalone, signals, Tailwind v4)
   │  JWT bearer · HttpClient + interceptor · ProblemDetail
   ▼
Spring Boot 3.5 / Java 21
   ├─ Web        controllers → ProblemDetail (per-field errors)
   ├─ Security   JWT filter · @PreAuthorize · bcrypt
   ├─ Service    courses · enrollment · quiz · gamification
   └─ Repository Spring Data JPA
   ▼
MySQL 8  (JPA/Hibernate · seeded demo data)`;

  protected readonly patterns: Pattern[] = [
    { area: 'Clean layers', areaEs: 'Capas limpias', how: 'controller → service → repository; entities never leave the service layer (DTO records only).', howEs: 'controlador → servicio → repositorio; las entidades nunca salen del servicio (solo DTOs record).' },
    { area: 'Auth / RBAC', areaEs: 'Auth / RBAC', how: 'stateless JWT (jjwt HS384), method security with @PreAuthorize, bcrypt, roles INSTRUCTOR/STUDENT.', howEs: 'JWT stateless (jjwt HS384), seguridad por método con @PreAuthorize, bcrypt, roles INSTRUCTOR/STUDENT.' },
    { area: 'Error handling', areaEs: 'Manejo de errores', how: '@RestControllerAdvice → RFC-7807 ProblemDetail with a per-field map the UI renders inline.', howEs: '@RestControllerAdvice → ProblemDetail RFC-7807 con mapa por campo que la UI muestra inline.' },
    { area: 'Ownership', areaEs: 'Propiedad', how: 'instructors edit only their own courses (403 otherwise); students see only their own progress.', howEs: 'los instructores editan solo sus cursos (403 en ajenos); el estudiante ve solo su progreso.' },
    { area: 'Gamification', areaEs: 'Gamificación', how: 'XP per lesson/quiz, day streak, badges (first lesson, 7-day streak, quiz ace, course done), certificate at 100%.', howEs: 'XP por lección/quiz, racha de días, insignias (primera lección, racha 7 días, quiz perfecto, curso completo), certificado al 100%.' },
    { area: 'Quiz integrity', areaEs: 'Integridad del quiz', how: 'the quiz-taking endpoint never sends correct answers; grading is server-side only.', howEs: 'el endpoint de quiz nunca envía las respuestas correctas; la calificación es solo del servidor.' },
    { area: 'i18n', areaEs: 'i18n', how: 'hand-rolled EN/ES on signals (no ngx-translate); language persists and seeds from the browser locale.', howEs: 'EN/ES a mano sobre signals (sin ngx-translate); el idioma persiste y se siembra del locale del navegador.' },
  ];

  protected sections() {
    return this.es()
      ? [
          {
            icon: 'graduation-cap', title: 'Alcance',
            body: ['LearnLoop cubre el ciclo completo de aprendizaje: un instructor crea cursos con módulos, lecciones (video/texto) y un quiz; un estudiante se inscribe, avanza lección a lección ganando XP, hace quizzes con calificación automática y feedback, y obtiene un certificado al completar el curso.'],
            bullets: ['Catálogo público con progreso del viewer', 'Vista de curso/lección con player y barra de progreso', 'Quiz interactivo con review por pregunta', 'Paneles por rol (instructor / estudiante)', 'Certificado imprimible'],
          },
          {
            icon: 'sparkles', title: 'Auth y seguridad',
            body: ['Autenticación JWT stateless con Spring Security: filtro que valida el token, contraseñas con bcrypt (comparación de tiempo constante), y autorización por método con @PreAuthorize. El front adjunta el bearer vía interceptor y limpia el token ante un 401.'],
          },
          {
            icon: 'check', title: 'Integridad del dominio',
            body: ['Las reglas críticas viven en el servidor: solo el instructor dueño edita su curso, el estudiante solo ve su propio progreso, y el quiz se califica en el backend sin exponer las respuestas correctas. La gamificación (XP, racha, insignias) es idempotente por lección/intento.'],
          },
          {
            icon: 'flame', title: 'Performance y UX',
            body: ['Rutas lazy + OnPush + signals en todo el front. Estados de loading (skeletons), empty (que enseñan) y error (con reintento) en cada pantalla. Animaciones cuidadas (barras de progreso, +XP flotante, confetti) que respetan prefers-reduced-motion.'],
          },
          {
            icon: 'flag', title: 'Testing',
            body: ['Backend con tests de JwtService (round-trip/tamper) y un flujo e2e author→enroll→complete→quiz-ace con insignias sobre H2 (CI-safe). Front verificado con screenshots en 3 breakpoints y un E2E que falla ante cualquier console.error.'],
          },
        ]
      : [
          {
            icon: 'graduation-cap', title: 'Scope',
            body: ['LearnLoop covers the full learning loop: an instructor builds courses with modules, lessons (video/text) and a quiz; a student enrolls, moves lesson by lesson earning XP, takes auto-graded quizzes with feedback, and earns a certificate on completion.'],
            bullets: ['Public catalog with viewer progress', 'Course/lesson view with player and progress bar', 'Interactive quiz with per-question review', 'Role-based panels (instructor / student)', 'Printable certificate'],
          },
          {
            icon: 'sparkles', title: 'Auth & security',
            body: ['Stateless JWT auth with Spring Security: a filter validates the token, passwords are bcrypt-hashed (constant-time compare), and authorization is enforced per method with @PreAuthorize. The frontend attaches the bearer via an interceptor and clears the token on a 401.'],
          },
          {
            icon: 'check', title: 'Domain integrity',
            body: ['Critical rules live on the server: only the owning instructor edits a course, a student sees only their own progress, and quizzes are graded in the backend without exposing the correct answers. Gamification (XP, streak, badges) is idempotent per lesson/attempt.'],
          },
          {
            icon: 'flame', title: 'Performance & UX',
            body: ['Lazy routes + OnPush + signals throughout. Loading (skeletons), empty (teaching) and error (with retry) states on every screen. Considered animations (progress bars, floating +XP, confetti) that respect prefers-reduced-motion.'],
          },
          {
            icon: 'flag', title: 'Testing',
            body: ['Backend tests cover JwtService (round-trip/tamper) and an author→enroll→complete→quiz-ace flow with badges on H2 (CI-safe). The frontend is verified with 3-breakpoint screenshots and an E2E that fails on any console.error.'],
          },
        ];
  }

  protected tradeoffs() {
    return this.es()
      ? [
          'Lecciones de video como placeholder (player con scrubber) — el foco está en el dominio LMS, no en streaming.',
          'Hibernate ddl-auto=update para la demo; Flyway queda para endurecimiento de producción.',
          'Al editar un curso, el quiz se re-autoría (el detalle no expone las respuestas correctas por diseño de seguridad).',
          'i18n a mano en vez de ngx-translate: menos dependencias, control total sobre el diccionario.',
        ]
      : [
          'Video lessons are placeholders (player with scrubber) — the focus is the LMS domain, not streaming.',
          'Hibernate ddl-auto=update for the demo; Flyway is reserved for production hardening.',
          'Editing a course re-authors the quiz (course detail never exposes correct answers, by security design).',
          'Hand-rolled i18n over ngx-translate: fewer dependencies, full control of the dictionary.',
        ];
  }
}
