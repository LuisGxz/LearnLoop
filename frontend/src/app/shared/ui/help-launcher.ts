import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import { TourService } from '../../core/demo/tour.service';

/**
 * Floating "How to explore" help, plus a role badge (Demo · role, can / can't)
 * and cross-role scenarios. The home of the guided-demo layer.
 */
@Component({
  selector: 'll-help-launcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <!-- Launcher button -->
    <button
      type="button"
      data-tour="help"
      (click)="open.set(!open())"
      class="fixed bottom-5 right-5 z-[70] grid h-12 w-12 place-items-center rounded-full bg-grow-600 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
      [attr.aria-label]="es() ? 'Cómo explorar' : 'How to explore'"
      aria-haspopup="dialog"
    >
      <lucide-icon [name]="open() ? 'arrow-left' : 'sparkles'" class="h-5 w-5" [class.rotate-90]="open()" />
    </button>

    @if (open()) {
      <div
        class="fixed bottom-20 right-5 z-[70] w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-2xl"
        role="dialog"
        [attr.aria-label]="es() ? 'Cómo explorar' : 'How to explore'"
      >
        <div class="max-h-[70vh] overflow-y-auto p-5">
          <h2 class="flex items-center gap-2 text-lg font-extrabold">
            <lucide-icon name="sparkles" class="h-5 w-5 text-grow-600" />
            {{ es() ? 'Cómo explorar' : 'How to explore' }}
          </h2>

          <!-- Cross-role aha (first) -->
          <div class="mt-3 rounded-2xl border border-grow-100 bg-grow-50 p-4">
            <p class="text-sm font-bold text-ink-900">
              {{
                es()
                  ? 'La mejor demo: crea un curso como instructor y luego tómalo como estudiante.'
                  : 'The best demo: build a course as an instructor, then take it as a student.'
              }}
            </p>
          </div>

          <!-- Role badge: can / can't -->
          @if (auth.isAuthenticated()) {
            <div class="mt-4 rounded-2xl border border-ink-200 p-4">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1 text-xs font-extrabold text-white">
                <lucide-icon name="sparkles" class="h-3.5 w-3.5" />
                {{ es() ? 'Demo · ' : 'Demo · ' }}{{ es() ? roleEs() : role() }}
              </span>
              <div class="mt-3 space-y-1.5 text-sm">
                @for (c of can(); track c) {
                  <p class="flex gap-2 text-ink-600"><lucide-icon name="check" class="mt-0.5 h-4 w-4 shrink-0 text-grow-600" />{{ c }}</p>
                }
                @for (c of cannot(); track c) {
                  <p class="flex gap-2 text-ink-400"><span class="mt-0.5 grid h-4 w-4 shrink-0 place-items-center text-berry-500">✕</span>{{ c }}</p>
                }
              </div>
            </div>
          }

          <!-- Scenarios -->
          <h3 class="mt-4 text-xs font-extrabold uppercase tracking-wide text-ink-400">
            {{ es() ? 'Escenarios' : 'Scenarios' }}
          </h3>
          <div class="mt-2 space-y-2">
            @for (sc of scenarios(); track sc.label) {
              <button
                type="button"
                (click)="go(sc.path)"
                class="flex w-full items-center gap-3 rounded-2xl border border-ink-200 p-3 text-left transition-colors hover:border-grow-600"
              >
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-grow-100 text-grow-600">
                  <lucide-icon [name]="sc.icon" class="h-4 w-4" />
                </span>
                <span class="text-sm font-bold">{{ sc.label }}</span>
              </button>
            }
          </div>

          <!-- Demo accounts -->
          @if (!auth.isAuthenticated()) {
            <div class="mt-4 rounded-2xl bg-ink-50 p-4 text-xs text-ink-600">
              <p class="font-extrabold text-ink-900">{{ es() ? 'Cuentas demo' : 'Demo accounts' }}</p>
              <p class="num mt-1">student@learnloop.dev · instructor@learnloop.dev</p>
              <p class="num">Demo1234!</p>
            </div>
          }

          <!-- Replay tour -->
          <button
            type="button"
            (click)="replay()"
            class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 text-sm font-extrabold text-white transition-colors hover:bg-ink-600"
          >
            <lucide-icon name="play" class="h-4 w-4" />
            {{ es() ? 'Ver el tour guiado' : 'Replay the guided tour' }}
          </button>
        </div>
      </div>
    }
  `,
})
export class HelpLauncher {
  protected readonly auth = inject(AuthService);
  private readonly i18n = inject(LanguageService);
  private readonly tour = inject(TourService);
  private readonly router = inject(Router);

  protected readonly es = this.i18n.isSpanish;
  protected readonly open = signal(false);

  protected readonly role = computed(() => (this.auth.isInstructor() ? 'Instructor' : 'Student'));
  protected readonly roleEs = computed(() => (this.auth.isInstructor() ? 'Instructor' : 'Estudiante'));

  protected can(): string[] {
    if (this.auth.isInstructor()) {
      return this.es()
        ? ['Crear y editar cursos', 'Añadir módulos, lecciones y quizzes', 'Gestionar tu catálogo']
        : ['Create and edit courses', 'Add modules, lessons and quizzes', 'Manage your catalog'];
    }
    return this.es()
      ? ['Inscribirte y completar lecciones', 'Hacer quizzes y ganar XP/insignias', 'Obtener certificados']
      : ['Enroll and complete lessons', 'Take quizzes, earn XP/badges', 'Earn certificates'];
  }
  protected cannot(): string[] {
    if (this.auth.isInstructor()) {
      return this.es() ? ['Inscribirte como estudiante'] : ['Enroll as a student'];
    }
    return this.es() ? ['Crear cursos (rol instructor)'] : ["Create courses (instructor role)"];
  }

  protected scenarios() {
    const list: { label: string; icon: string; path: string }[] = [
      {
        label: this.es() ? 'Explorar el catálogo' : 'Browse the catalog',
        icon: 'book-open',
        path: '/',
      },
    ];
    if (this.auth.isInstructor()) {
      list.push({ label: this.es() ? 'Crear un curso' : 'Build a course', icon: 'pencil', path: '/teach/new' });
    } else if (this.auth.isStudent()) {
      list.push({ label: this.es() ? 'Mi aprendizaje' : 'My learning', icon: 'graduation-cap', path: '/learning' });
    } else {
      list.push({ label: this.es() ? 'Entrar con una cuenta demo' : 'Sign in with a demo account', icon: 'log-in', path: '/login' });
    }
    list.push({ label: this.es() ? 'Sobre el proyecto' : 'About this project', icon: 'sparkles', path: '/about' });
    return list;
  }

  protected go(path: string): void {
    this.open.set(false);
    void this.router.navigateByUrl(path);
  }

  protected replay(): void {
    this.open.set(false);
    void this.router.navigateByUrl('/').then(() => setTimeout(() => this.tour.start(), 350));
  }
}
