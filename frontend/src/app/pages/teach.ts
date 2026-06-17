import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CourseService } from '../core/courses/course.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { CourseSummary } from '../core/models';
import { coverGradient } from '../shared/cover-gradient';
import { Skeleton } from '../shared/ui/skeleton';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';

/** Instructor dashboard: own courses with edit / delete + new-course CTA. */
@Component({
  selector: 'll-teach',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, TPipe, Skeleton, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold sm:text-3xl">{{ 'teach.title' | t }}</h1>
          <p class="mt-1 text-ink-600">{{ 'teach.subtitle' | t }}</p>
        </div>
        <a
          routerLink="/teach/new"
          class="inline-flex items-center gap-2 rounded-full bg-grow-600 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98]"
        >
          <lucide-icon name="circle-plus" class="h-4 w-4" />
          {{ 'teach.new' | t }}
        </a>
      </div>

      @if (loading()) {
        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (i of [1, 2, 3]; track i) {
            <div class="overflow-hidden rounded-3xl border border-ink-200 bg-white">
              <ll-skeleton height="6rem" />
              <div class="space-y-2 p-4"><ll-skeleton height="1.1rem" /><ll-skeleton height="0.75rem" /></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="mt-8"><ll-error-state [message]="error()" (retry)="load()" /></div>
      } @else if (courses().length === 0) {
        <div class="mt-8">
          <ll-empty-state
            icon="pencil"
            [title]="('teach.empty.title' | t)"
            [body]="('teach.empty.body' | t)"
          >
            <a
              routerLink="/teach/new"
              class="inline-flex items-center gap-2 rounded-full bg-grow-600 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-grow-500"
            >
              <lucide-icon name="circle-plus" class="h-4 w-4" />{{ 'teach.new' | t }}
            </a>
          </ll-empty-state>
        </div>
      } @else {
        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (c of courses(); track c.id) {
            <div class="overflow-hidden rounded-3xl border border-ink-200 bg-white">
              <div class="relative h-24" [style.background]="grad(c.coverGradient)">
                <span class="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
                  {{ c.level }}
                </span>
              </div>
              <div class="p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-wide text-grow-600">{{ c.category }}</p>
                <p class="mt-0.5 font-extrabold leading-snug">{{ c.title }}</p>
                <div class="mt-2 flex items-center gap-3 text-xs font-bold text-ink-400">
                  <span class="num">{{ c.moduleCount }} {{ 'catalog.modules' | t }}</span>
                  <span aria-hidden="true">·</span>
                  <span class="num">{{ c.lessonCount }} {{ 'teach.lessonsCount' | t }}</span>
                </div>
                <div class="mt-4 flex gap-2">
                  <a
                    [routerLink]="['/teach', c.id, 'edit']"
                    class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-grow-600 px-4 py-2 text-xs font-extrabold text-white transition-all hover:bg-grow-500"
                  >
                    <lucide-icon name="pencil" class="h-3.5 w-3.5" />{{ 'teach.edit' | t }}
                  </a>
                  <a
                    [routerLink]="['/course', c.id]"
                    class="inline-flex items-center justify-center rounded-full border border-ink-200 px-4 py-2 text-xs font-extrabold text-ink-900 transition-colors hover:border-grow-600"
                  >
                    {{ 'teach.view' | t }}
                  </a>
                  <button
                    type="button"
                    (click)="remove(c)"
                    [disabled]="deleting() === c.id"
                    class="inline-flex items-center justify-center rounded-full border border-ink-200 px-3 py-2 text-ink-400 transition-colors hover:border-berry-500 hover:text-berry-500 disabled:opacity-50"
                    [attr.aria-label]="('teach.delete' | t)"
                  >
                    <lucide-icon name="trash-2" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class Teach {
  private readonly courseSvc = inject(CourseService);
  private readonly i18n = inject(LanguageService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly courses = signal<CourseSummary[]>([]);
  protected readonly deleting = signal<number | null>(null);

  protected readonly grad = coverGradient;

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.courses.set(await this.courseSvc.mine());
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(course: CourseSummary): Promise<void> {
    if (this.deleting()) return;
    if (typeof window !== 'undefined' && !window.confirm(this.i18n.t('teach.deleteConfirm'))) return;
    this.deleting.set(course.id);
    try {
      await this.courseSvc.delete(course.id);
      this.courses.set(this.courses().filter((c) => c.id !== course.id));
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.deleting.set(null);
    }
  }
}
