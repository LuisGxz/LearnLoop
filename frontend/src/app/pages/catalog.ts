import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CourseService } from '../core/courses/course.service';
import { AuthService } from '../core/auth/auth.service';
import { TourService } from '../core/demo/tour.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { CourseSummary } from '../core/models';
import { CourseCard } from '../shared/ui/course-card';
import { Skeleton } from '../shared/ui/skeleton';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';

type Stat = { icon: string; tone: string; value: string; label: string };

/** Screen 1 — course catalog with a greeting + progress stats and a course grid. */
@Component({
  selector: 'll-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, TPipe, CourseCard, Skeleton, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <!-- Header: stats strip (signed in) or hero (signed out) -->
      @if (auth.isAuthenticated()) {
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-2xl font-extrabold sm:text-3xl">
              {{ 'stats.greeting' | t }}, {{ firstName() }} 👋
            </h1>
            <p class="mt-1 text-ink-600">{{ 'catalog.subtitle' | t }}</p>
          </div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          @for (s of stats(); track s.label) {
            <div class="rounded-2xl border border-ink-200 bg-white px-4 py-3">
              <span
                class="grid h-8 w-8 place-items-center rounded-xl"
                [class]="s.tone"
              >
                <lucide-icon [name]="s.icon" class="h-4 w-4" />
              </span>
              <p class="num mt-2 text-xl font-extrabold leading-none">{{ s.value }}</p>
              <p class="mt-1 text-xs text-ink-400">{{ s.label }}</p>
            </div>
          }
        </div>
      } @else {
        <div class="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8">
          <p class="font-mono text-xs uppercase tracking-widest text-grow-600">
            {{ 'catalog.heroEyebrow' | t }}
          </p>
          <h1 class="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
            {{ 'catalog.heroTitle' | t }}
          </h1>
          <p class="mt-3 max-w-xl text-ink-600">{{ 'catalog.heroBody' | t }}</p>
          <a
            routerLink="/login"
            class="mt-5 inline-flex items-center gap-2 rounded-full bg-grow-600 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98]"
          >
            <lucide-icon name="log-in" class="h-4 w-4" />
            {{ 'nav.signIn' | t }}
          </a>
        </div>
      }

      <!-- Section heading -->
      <div class="mb-5 mt-10 flex items-center gap-2">
        <lucide-icon name="book-open" class="h-5 w-5 text-grow-600" />
        <h2 class="text-lg font-extrabold">{{ 'catalog.title' | t }}</h2>
      </div>

      <!-- Course grid / states -->
      @if (loading()) {
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="overflow-hidden rounded-3xl border border-ink-200 bg-white">
              <ll-skeleton height="7rem" />
              <div class="space-y-2 p-4">
                <ll-skeleton height="0.75rem" />
                <ll-skeleton height="1.1rem" />
                <ll-skeleton height="0.75rem" />
              </div>
            </div>
          }
        </div>
      } @else if (error()) {
        <ll-error-state [message]="error()" (retry)="load()" />
      } @else if (courses().length === 0) {
        <ll-empty-state
          icon="book-open"
          [title]="('catalog.empty.title' | t)"
          [body]="('catalog.empty.body' | t)"
        />
      } @else {
        <div data-tour="catalog" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (c of courses(); track c.id) {
            <ll-course-card [course]="c" />
          }
        </div>
      }
    </section>
  `,
})
export class Catalog {
  protected readonly auth = inject(AuthService);
  private readonly i18n = inject(LanguageService);
  private readonly courseSvc = inject(CourseService);
  private readonly tour = inject(TourService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly all = signal<CourseSummary[]>([]);

  /** In-progress first, then not-started, then completed. */
  protected readonly courses = computed(() =>
    [...this.all()].sort((a, b) => this.rank(a) - this.rank(b)),
  );

  protected readonly firstName = computed(() => this.auth.user()?.name?.split(' ')[0] ?? '');

  protected readonly stats = computed<Stat[]>(() => {
    const u = this.auth.user();
    const enrolled = this.all().filter((c) => c.enrolled);
    const avg =
      enrolled.length === 0
        ? 0
        : Math.round(enrolled.reduce((s, c) => s + (c.progressPercent ?? 0), 0) / enrolled.length);
    return [
      { icon: 'flame', tone: 'bg-sun-100 text-sun-500', value: `${u?.streakDays ?? 0}`, label: this.i18n.t('stats.streak') },
      { icon: 'gem', tone: 'bg-berry-100 text-berry-500', value: `${u?.xp ?? 0}`, label: this.i18n.t('stats.xp') },
      { icon: 'book-open', tone: 'bg-grow-100 text-grow-600', value: `${enrolled.length}`, label: this.i18n.t('stats.enrolled') },
      { icon: 'trophy', tone: 'bg-grow-100 text-grow-600', value: `${avg}%`, label: this.i18n.t('stats.avgProgress') },
    ];
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.all.set(await this.courseSvc.catalog());
      // Auto-start the guided tour once, after the grid has painted.
      if (typeof window !== 'undefined') setTimeout(() => this.tour.maybeAutoStart(), 600);
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  private rank(c: CourseSummary): number {
    const p = c.progressPercent ?? 0;
    if (c.enrolled && p >= 100) return 2; // completed
    if (c.enrolled) return 0; // in progress / just enrolled
    return 1; // not enrolled
  }
}
