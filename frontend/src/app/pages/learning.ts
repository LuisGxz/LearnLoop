import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LearningService } from '../core/courses/learning.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { EnrollmentSummary } from '../core/models';
import { coverGradient } from '../shared/cover-gradient';
import { ProgressBar } from '../shared/ui/progress-bar';
import { Skeleton } from '../shared/ui/skeleton';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';

/** Student dashboard: enrolled courses split by in-progress / completed. */
@Component({
  selector: 'll-learning',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, LucideAngularModule, TPipe, ProgressBar, Skeleton, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 class="text-2xl font-extrabold sm:text-3xl">{{ 'learn.title' | t }}</h1>
      <p class="mt-1 text-ink-600">{{ 'learn.subtitle' | t }}</p>

      @if (loading()) {
        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (i of [1, 2, 3]; track i) {
            <div class="overflow-hidden rounded-3xl border border-ink-200 bg-white">
              <ll-skeleton height="6rem" />
              <div class="space-y-2 p-4">
                <ll-skeleton height="1.1rem" /><ll-skeleton height="0.75rem" />
              </div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="mt-8"><ll-error-state [message]="error()" (retry)="load()" /></div>
      } @else if (enrollments().length === 0) {
        <div class="mt-8">
          <ll-empty-state
            icon="graduation-cap"
            [title]="('learn.empty.title' | t)"
            [body]="('learn.empty.body' | t)"
          >
            <a
              routerLink="/"
              class="inline-flex items-center gap-2 rounded-full bg-grow-600 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-grow-500"
            >
              <lucide-icon name="book-open" class="h-4 w-4" />
              {{ 'learn.browse' | t }}
            </a>
          </ll-empty-state>
        </div>
      } @else {
        @if (inProgress().length) {
          <h2 class="mb-4 mt-8 text-sm font-extrabold uppercase tracking-wide text-ink-400">
            {{ 'learn.inProgress' | t }}
          </h2>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (e of inProgress(); track e.courseId) {
              <ng-container *ngTemplateOutlet="card; context: { $implicit: e }" />
            }
          </div>
        }
        @if (completed().length) {
          <h2 class="mb-4 mt-10 text-sm font-extrabold uppercase tracking-wide text-ink-400">
            {{ 'learn.completed' | t }}
          </h2>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (e of completed(); track e.courseId) {
              <ng-container *ngTemplateOutlet="card; context: { $implicit: e }" />
            }
          </div>
        }
      }
    </section>

    <ng-template #card let-e>
      <div class="overflow-hidden rounded-3xl border border-ink-200 bg-white">
        <div class="relative h-24" [style.background]="grad(e.coverGradient)">
          @if (e.completed) {
            <span class="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-grow-600">
              <lucide-icon name="check" class="h-3 w-3" />{{ 'catalog.badge.done' | t }}
            </span>
          }
        </div>
        <div class="p-4">
          <p class="text-[11px] font-extrabold uppercase tracking-wide text-grow-600">{{ e.category }}</p>
          <p class="mt-0.5 font-extrabold leading-snug">{{ e.title }}</p>
          <div class="mt-3"><ll-progress-bar [percent]="e.progressPercent" /></div>
          <div class="mt-4 flex gap-2">
            <a
              [routerLink]="['/course', e.courseId]"
              class="flex-1 rounded-full bg-grow-600 px-4 py-2 text-center text-xs font-extrabold text-white transition-all hover:bg-grow-500"
            >
              {{ (e.completed ? 'teach.view' : 'learn.resume') | t }}
            </a>
            @if (e.completed) {
              <a
                [routerLink]="['/certificate', e.courseId]"
                class="inline-flex items-center gap-1 rounded-full border border-ink-200 px-4 py-2 text-xs font-extrabold text-ink-900 transition-colors hover:border-grow-600"
              >
                <lucide-icon name="award" class="h-3.5 w-3.5" />{{ 'learn.certificate' | t }}
              </a>
            }
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class Learning {
  private readonly learning = inject(LearningService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly enrollments = signal<EnrollmentSummary[]>([]);

  protected readonly inProgress = computed(() => this.enrollments().filter((e) => !e.completed));
  protected readonly completed = computed(() => this.enrollments().filter((e) => e.completed));

  protected readonly grad = coverGradient;

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.enrollments.set(await this.learning.myEnrollments());
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.loading.set(false);
    }
  }
}
