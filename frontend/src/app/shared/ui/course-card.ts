import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CourseSummary } from '../../core/models';
import { LanguageService } from '../../core/i18n/language.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { coverGradient } from '../cover-gradient';
import { ProgressBar } from './progress-bar';

/** Catalog/“my learning” course tile: gradient cover, status badge, progress. */
@Component({
  selector: 'll-course-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, TPipe, ProgressBar],
  template: `
    <a
      [routerLink]="['/course', course().id]"
      class="group block overflow-hidden rounded-3xl border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      [class]="inProgress() ? 'border-grow-600 shadow-md' : 'border-ink-200'"
    >
      <!-- Cover -->
      <div class="relative h-28" [style.background]="gradient()">
        @if (completed()) {
          <span
            class="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-grow-600"
          >
            <lucide-icon name="check" class="h-3 w-3" />
            {{ 'catalog.badge.done' | t }}
          </span>
        } @else if (isNew()) {
          <span
            class="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-ink-900"
          >
            {{ 'catalog.badge.new' | t }}
          </span>
        }
        <span
          class="absolute bottom-3 right-3 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur"
        >
          {{ course().level }}
        </span>
      </div>

      <!-- Body -->
      <div class="p-4">
        <p class="text-[11px] font-extrabold uppercase tracking-wide text-grow-600">
          {{ course().category }}
        </p>
        <p class="mt-0.5 font-extrabold leading-snug text-ink-900 group-hover:text-grow-600">
          {{ course().title }}
        </p>
        <p class="mt-1 text-xs text-ink-400">{{ course().instructorName }}</p>

        @if (enrolled()) {
          <div class="mt-3">
            <ll-progress-bar [percent]="course().progressPercent ?? 0" />
          </div>
          @if (inProgress()) {
            <p class="mt-2 flex items-center gap-1 text-[11px] font-extrabold text-grow-600">
              <lucide-icon name="play" class="h-3 w-3" />
              {{ 'catalog.continue' | t }}
            </p>
          }
        } @else {
          <div class="mt-3 flex items-center gap-3 text-xs font-bold text-ink-400">
            <span class="num">{{ course().moduleCount }} {{ 'catalog.modules' | t }}</span>
            <span aria-hidden="true">·</span>
            <span class="num">{{ course().lessonCount }} {{ 'catalog.lessons' | t }}</span>
            <span aria-hidden="true">·</span>
            <span class="num">{{ course().durationMin }} min</span>
          </div>
        }
      </div>
    </a>
  `,
})
export class CourseCard {
  private readonly i18n = inject(LanguageService);
  readonly course = input.required<CourseSummary>();

  protected readonly gradient = computed(() => coverGradient(this.course().coverGradient));
  protected readonly enrolled = computed(() => this.course().enrolled);
  protected readonly completed = computed(() => (this.course().progressPercent ?? 0) >= 100);
  protected readonly inProgress = computed(() => {
    const p = this.course().progressPercent ?? 0;
    return this.enrolled() && p > 0 && p < 100;
  });
  protected readonly isNew = computed(() => !this.enrolled());
}
