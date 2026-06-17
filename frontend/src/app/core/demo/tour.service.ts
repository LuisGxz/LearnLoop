import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export interface TourStep {
  target: string | null; // CSS selector to spotlight, or null = centered
  title: { en: string; es: string };
  body: { en: string; es: string };
}

const SEEN_KEY = 'learnloop.tour.seen';

/**
 * Lightweight role-aware product tour. Steps spotlight a target element (or
 * center when none). Auto-starts once per browser; replayable from the help
 * panel. Steps adapt to the signed-in role.
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly auth = inject(AuthService);

  private readonly _active = signal(false);
  private readonly _index = signal(0);
  readonly active = this._active.asReadonly();
  readonly index = this._index.asReadonly();

  readonly steps = computed<TourStep[]>(() => this.buildSteps());
  readonly step = computed<TourStep | null>(() => this.steps()[this._index()] ?? null);
  readonly isLast = computed(() => this._index() === this.steps().length - 1);

  /** Start the tour from scratch (used by auto-start and replay). */
  start(): void {
    this._index.set(0);
    this._active.set(true);
  }

  next(): void {
    if (this.isLast()) this.finish();
    else this._index.set(this._index() + 1);
  }

  prev(): void {
    if (this._index() > 0) this._index.set(this._index() - 1);
  }

  finish(): void {
    this._active.set(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(SEEN_KEY, '1');
  }

  /** Auto-start once per browser, after first paint of the catalog. */
  maybeAutoStart(): void {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(SEEN_KEY)) return;
    this.start();
  }

  private buildSteps(): TourStep[] {
    const role = this.auth.user()?.role;
    const common: TourStep[] = [
      {
        target: '[data-tour="brand"]',
        title: { en: 'Welcome to LearnLoop', es: 'Bienvenido a LearnLoop' },
        body: {
          en: 'A gamified learning platform. This quick tour shows what you can do — you can replay it anytime from the help button.',
          es: 'Una plataforma de aprendizaje con gamificación. Este tour rápido muestra qué puedes hacer — puedes repetirlo cuando quieras desde el botón de ayuda.',
        },
      },
      {
        target: '[data-tour="catalog"]',
        title: { en: 'Browse the catalog', es: 'Explora el catálogo' },
        body: {
          en: 'Every course shows its level, length and — once you enroll — your progress. Open one to start a lesson.',
          es: 'Cada curso muestra su nivel, duración y — al inscribirte — tu progreso. Abre uno para empezar una lección.',
        },
      },
    ];

    if (role === 'INSTRUCTOR') {
      common.push({
        target: '[data-tour="role-nav"]',
        title: { en: "You're an instructor", es: 'Eres instructor' },
        body: {
          en: 'Open “Teach” to build courses — modules, lessons and a quiz — then manage your catalog.',
          es: 'Abre “Enseñar” para crear cursos — módulos, lecciones y un quiz — y gestionar tu catálogo.',
        },
      });
    } else if (role === 'STUDENT') {
      common.push({
        target: '[data-tour="role-nav"]',
        title: { en: "You're a student", es: 'Eres estudiante' },
        body: {
          en: 'Open “My learning” to resume courses, see your progress and grab certificates.',
          es: 'Abre “Mi aprendizaje” para retomar cursos, ver tu progreso y obtener certificados.',
        },
      });
    }

    common.push({
      target: '[data-tour="help"]',
      title: { en: 'Explore both roles', es: 'Explora ambos roles' },
      body: {
        en: 'The best part: create a course as an instructor, then take it as a student. Open this help panel for demo accounts and guided scenarios.',
        es: 'Lo mejor: crea un curso como instructor y luego tómalo como estudiante. Abre este panel de ayuda para cuentas demo y escenarios guiados.',
      },
    });

    return common;
  }
}
