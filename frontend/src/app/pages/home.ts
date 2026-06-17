import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../core/auth/auth.service';
import { LanguageService } from '../core/i18n/language.service';

/**
 * Welcome hero. Foundation placeholder for the catalog (Fase 5 replaces the
 * lower section with the real course grid).
 */
@Component({
  selector: 'll-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p class="mb-4 font-mono text-xs uppercase tracking-widest text-grow-600">
        {{ es() ? 'Aprende haciendo' : 'Learn by doing' }}
      </p>
      <h1 class="max-w-2xl text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
        {{ es() ? greetEs() : greetEn() }}
      </h1>
      <p class="mt-4 max-w-xl text-lg text-ink-600">
        {{
          es()
            ? 'Cursos con lecciones, quizzes auto-calificados, progreso, rachas e insignias. Aprende a tu ritmo y gana XP.'
            : 'Courses with lessons, auto-graded quizzes, progress, streaks and badges. Learn at your pace and earn XP.'
        }}
      </p>
      <div class="mt-7 flex flex-wrap gap-3">
        <a
          routerLink="/"
          class="inline-flex items-center gap-2 rounded-full bg-grow-600 px-6 py-3 font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98]"
        >
          <lucide-icon name="book-open" class="h-5 w-5" />
          {{ es() ? 'Explorar cursos' : 'Browse courses' }}
        </a>
        @if (!auth.isAuthenticated()) {
          <a
            routerLink="/login"
            class="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-6 py-3 font-extrabold text-ink-900 transition-colors hover:border-grow-600"
          >
            {{ es() ? 'Entrar' : 'Sign in' }}
          </a>
        }
      </div>

      <div class="mt-12 grid gap-4 sm:grid-cols-3">
        @for (f of features(); track f.icon) {
          <div class="rounded-3xl border border-ink-200 bg-white p-5">
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-grow-100 text-grow-600">
              <lucide-icon [name]="f.icon" class="h-5 w-5" />
            </span>
            <h3 class="mt-3 font-extrabold">{{ f.title }}</h3>
            <p class="mt-1 text-sm text-ink-600">{{ f.body }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly i18n = inject(LanguageService);
  protected readonly es = this.i18n.isSpanish;

  protected greetEn(): string {
    const name = this.auth.user()?.name?.split(' ')[0];
    return name ? `Pick up where you left off, ${name} 👋` : 'Build real skills, one loop at a time.';
  }
  protected greetEs(): string {
    const name = this.auth.user()?.name?.split(' ')[0];
    return name ? `Sigue donde lo dejaste, ${name} 👋` : 'Aprende de verdad, un loop a la vez.';
  }

  protected features() {
    return this.es()
      ? [
          { icon: 'book-open', title: 'Cursos guiados', body: 'Módulos y lecciones en video o texto, paso a paso.' },
          { icon: 'check', title: 'Quizzes auto-calificados', body: 'Feedback inmediato y explicaciones por pregunta.' },
          { icon: 'trophy', title: 'XP, rachas e insignias', body: 'Mantén el impulso y celebra cada logro.' },
        ]
      : [
          { icon: 'book-open', title: 'Guided courses', body: 'Modules and video/text lessons, step by step.' },
          { icon: 'check', title: 'Auto-graded quizzes', body: 'Instant feedback and per-question explanations.' },
          { icon: 'trophy', title: 'XP, streaks & badges', body: 'Keep momentum and celebrate every win.' },
        ];
  }
}
