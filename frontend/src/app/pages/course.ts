import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CourseService } from '../core/courses/course.service';
import { LearningService } from '../core/courses/learning.service';
import { AuthService } from '../core/auth/auth.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { CourseDetail, LessonDetail, ModuleDetail } from '../core/models';
import { coverGradient } from '../shared/cover-gradient';
import { ProgressBar } from '../shared/ui/progress-bar';
import { Spinner } from '../shared/ui/spinner';
import { ErrorState } from '../shared/ui/error-state';

interface FlatLesson {
  lesson: LessonDetail;
  module: ModuleDetail;
  moduleIndex: number;
}

/** Screen 2 — course/lesson view: player + module list + complete-to-earn-XP. */
@Component({
  selector: 'll-course',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, TPipe, ProgressBar, Spinner, ErrorState],
  template: `
    @if (loading()) {
      <div class="grid place-items-center py-32"><ll-spinner [size]="28" /></div>
    } @else if (error()) {
      <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ll-error-state [message]="error()" (retry)="load()" />
      </div>
    } @else if (course(); as c) {
      <section class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <a
          routerLink="/"
          class="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink-600 transition-colors hover:text-grow-600"
        >
          <lucide-icon name="arrow-left" class="h-4 w-4" />
          {{ 'course.back' | t }}
        </a>

        <div class="overflow-hidden rounded-3xl border border-ink-200 bg-white">
          <!-- Course progress header -->
          <div class="flex items-center gap-4 border-b border-ink-200 bg-ink-50 px-5 py-3">
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-extrabold">{{ c.title }}</p>
              <p class="truncate text-xs text-ink-400">
                {{ 'course.by' | t }} {{ c.instructor.name }}
              </p>
            </div>
            <div class="hidden w-48 sm:block">
              <ll-progress-bar [percent]="c.progressPercent" />
            </div>
            <span class="num text-sm font-extrabold text-grow-600 sm:hidden">{{ c.progressPercent }}%</span>
          </div>

          <div class="grid lg:grid-cols-[1fr_320px]">
            <!-- Player / lesson body -->
            <div class="p-5">
              @if (activeLesson(); as al) {
                @if (al.lesson.type === 'VIDEO') {
                  <div
                    class="relative grid aspect-video place-items-center overflow-hidden rounded-2xl"
                    [style.background]="gradient()"
                  >
                    <button
                      type="button"
                      class="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-xl transition-transform hover:scale-105"
                      aria-label="Play"
                    >
                      <lucide-icon name="play" class="ml-1 h-7 w-7 text-ink-900" />
                    </button>
                    <div class="absolute inset-x-3 bottom-3 flex items-center gap-3 text-[11px] text-white num">
                      <span>00:00</span>
                      <div class="h-1.5 flex-1 rounded-full bg-white/30">
                        <div class="h-full w-1/4 rounded-full bg-white/90"></div>
                      </div>
                      <span>{{ al.lesson.durationMin }}:00</span>
                    </div>
                  </div>
                } @else {
                  <div class="rounded-2xl border border-ink-200 bg-ink-50/50 p-6">
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full bg-berry-100 px-3 py-1 text-[11px] font-extrabold text-berry-500"
                    >
                      <lucide-icon name="book-open" class="h-3.5 w-3.5" />
                      {{ 'course.lessonType.text' | t }}
                    </span>
                    <p class="mt-4 text-[15px] leading-relaxed text-ink-900">{{ al.lesson.content }}</p>
                  </div>
                }

                <div class="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-grow-600">
                      {{ 'course.module' | t }} {{ al.moduleIndex + 1 }} · {{ 'course.lesson' | t }}
                      {{ al.lesson.position }}
                    </p>
                    <h1 class="text-xl font-extrabold">{{ al.lesson.title }}</h1>
                  </div>

                  @if (al.lesson.completed) {
                    <span
                      class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-grow-100 px-4 py-2.5 text-sm font-extrabold text-grow-600"
                    >
                      <lucide-icon name="check" class="h-4 w-4" />
                      {{ 'course.completed' | t }}
                    </span>
                  } @else if (!auth.isAuthenticated()) {
                    <a
                      [routerLink]="['/login']"
                      [queryParams]="{ redirect: redirectUrl() }"
                      class="shrink-0 whitespace-nowrap rounded-full bg-grow-600 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98]"
                    >
                      {{ 'course.signInToEnroll' | t }}
                    </a>
                  } @else if (!c.enrolled) {
                    <button
                      type="button"
                      (click)="enroll()"
                      [disabled]="enrolling()"
                      class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-grow-600 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98] disabled:opacity-60"
                    >
                      @if (enrolling()) { <ll-spinner [size]="16" /> }
                      {{ 'course.enrollCta' | t }}
                    </button>
                  } @else {
                    <button
                      type="button"
                      (click)="complete(al.lesson)"
                      [disabled]="completing()"
                      class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-grow-600 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98] disabled:opacity-60"
                    >
                      @if (completing()) { <ll-spinner [size]="16" /> }
                      {{ 'course.complete' | t }} +{{ al.lesson.xpReward }} XP
                    </button>
                  }
                </div>

                @if (al.lesson.type === 'VIDEO') {
                  <p class="mt-2 max-w-xl text-sm text-ink-600">{{ al.lesson.content }}</p>
                }

                <!-- Next up + course-done callouts -->
                @if (c.completed) {
                  <div
                    class="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-grow-100 bg-grow-50 p-4"
                  >
                    <lucide-icon name="trophy" class="h-5 w-5 shrink-0 text-grow-600" />
                    <p class="text-sm font-extrabold text-grow-600">{{ 'course.courseDone' | t }}</p>
                    <a
                      [routerLink]="['/certificate', c.id]"
                      class="ml-auto rounded-full bg-grow-600 px-4 py-2 text-xs font-extrabold text-white transition-all hover:bg-grow-500"
                    >
                      {{ 'course.viewCertificate' | t }}
                    </a>
                  </div>
                } @else if (nextLesson(); as nx) {
                  @if (al.lesson.completed) {
                    <button
                      type="button"
                      (click)="select(nx.lesson.id)"
                      class="mt-5 flex w-full items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 text-left transition-colors hover:border-grow-600"
                    >
                      <span class="grid h-9 w-9 place-items-center rounded-xl bg-grow-100 text-grow-600">
                        <lucide-icon name="play" class="h-4 w-4" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-[11px] font-extrabold uppercase tracking-wide text-ink-400">
                          {{ 'course.nextUp' | t }}
                        </span>
                        <span class="block truncate font-extrabold">{{ nx.lesson.title }}</span>
                      </span>
                      <lucide-icon name="arrow-left" class="h-4 w-4 rotate-180 text-ink-400" />
                    </button>
                  }
                }
              }
            </div>

            <!-- Module / lesson list -->
            <aside class="border-t border-ink-200 bg-ink-50/50 p-4 lg:border-l lg:border-t-0">
              @for (m of c.modules; track m.id; let mi = $index) {
                <p class="mb-2 px-2 pt-2 text-xs font-extrabold uppercase tracking-wide text-ink-400">
                  {{ 'course.module' | t }} {{ mi + 1 }} · {{ m.title }}
                </p>
                <ul class="mb-3 space-y-1">
                  @for (l of m.lessons; track l.id) {
                    <li>
                      <button
                        type="button"
                        (click)="select(l.id)"
                        class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-colors"
                        [class]="l.id === activeLessonId() ? 'border border-grow-600 bg-white shadow-sm' : 'hover:bg-white'"
                      >
                        <span
                          class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-extrabold"
                          [class]="
                            l.completed
                              ? 'bg-grow-500 text-white'
                              : l.id === activeLessonId()
                                ? 'bg-ink-900 text-white'
                                : 'bg-ink-200 text-ink-600'
                          "
                        >
                          @if (l.completed) {
                            <lucide-icon name="check" class="h-3.5 w-3.5" />
                          } @else {
                            {{ l.position }}
                          }
                        </span>
                        <span class="min-w-0 flex-1">
                          <span
                            class="block truncate font-extrabold"
                            [class.text-ink-400]="l.completed"
                          >
                            {{ l.title }}
                          </span>
                          <span class="num text-[11px] text-ink-400">
                            {{ l.durationMin }} min
                            @if (l.id === activeLessonId()) {
                              · <span class="font-extrabold text-grow-600">{{ 'course.watching' | t }}</span>
                            }
                          </span>
                        </span>
                      </button>
                    </li>
                  }
                  @if (m.quiz; as q) {
                    <li>
                      <a
                        [routerLink]="['/quiz', q.id]"
                        class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-colors hover:bg-white"
                      >
                        <span
                          class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-extrabold"
                          [class]="q.bestScore != null ? 'bg-grow-500 text-white' : 'bg-berry-100 text-berry-500'"
                        >
                          @if (q.bestScore != null) {
                            <lucide-icon name="check" class="h-3.5 w-3.5" />
                          } @else {
                            ?
                          }
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class="block truncate font-extrabold">{{ q.title }}</span>
                          <span class="text-[11px] text-ink-400">
                            @if (q.bestScore != null) {
                              <span class="num font-extrabold text-grow-600">{{ 'course.quizPassed' | t }} · {{ q.bestScore }}%</span>
                            } @else {
                              {{ q.questionCount }} {{ 'quiz.questions' | t }}
                            }
                          </span>
                        </span>
                      </a>
                    </li>
                  }
                </ul>
              }
            </aside>
          </div>
        </div>
      </section>

      <!-- Floating +XP flash -->
      @if (xpFlash() !== null) {
        <div class="pointer-events-none fixed inset-x-0 top-24 z-[60] grid place-items-center">
          <div class="xp-flash flex items-center gap-2 rounded-full bg-berry-500 px-5 py-2.5 font-extrabold text-white shadow-xl">
            <lucide-icon name="gem" class="h-5 w-5" />
            +{{ xpFlash() }} XP
          </div>
        </div>
      }
    }
  `,
  styles: `
    .xp-flash {
      animation: xpfloat 1.4s ease-out forwards;
    }
    @keyframes xpfloat {
      0% { opacity: 0; transform: translateY(12px) scale(0.9); }
      20% { opacity: 1; transform: translateY(0) scale(1); }
      80% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-16px) scale(0.95); }
    }
    @media (prefers-reduced-motion: reduce) {
      .xp-flash { animation: none; }
    }
  `,
})
export class Course {
  protected readonly auth = inject(AuthService);
  private readonly i18n = inject(LanguageService);
  private readonly courseSvc = inject(CourseService);
  private readonly learning = inject(LearningService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly course = signal<CourseDetail | null>(null);
  protected readonly activeLessonId = signal<number | null>(null);
  protected readonly completing = signal(false);
  protected readonly enrolling = signal(false);
  protected readonly xpFlash = signal<number | null>(null);

  private readonly courseId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly flat = computed<FlatLesson[]>(() => {
    const c = this.course();
    if (!c) return [];
    return c.modules.flatMap((module, moduleIndex) =>
      module.lessons.map((lesson) => ({ lesson, module, moduleIndex })),
    );
  });

  protected readonly activeLesson = computed<FlatLesson | null>(() => {
    const id = this.activeLessonId();
    return this.flat().find((f) => f.lesson.id === id) ?? this.flat()[0] ?? null;
  });

  protected readonly nextLesson = computed<FlatLesson | null>(() => {
    const list = this.flat();
    const id = this.activeLessonId();
    const idx = list.findIndex((f) => f.lesson.id === id);
    if (idx === -1) return null;
    return list.slice(idx + 1).find((f) => !f.lesson.completed) ?? list[idx + 1] ?? null;
  });

  protected readonly gradient = computed(() =>
    coverGradient(this.course()?.coverGradient ?? 't-1'),
  );

  protected readonly redirectUrl = computed(() => `/course/${this.courseId}`);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const c = await this.courseSvc.detail(this.courseId);
      this.course.set(c);
      this.activeLessonId.set(this.firstUnfinished(c) ?? this.flat()[0]?.lesson.id ?? null);
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  protected select(lessonId: number): void {
    this.activeLessonId.set(lessonId);
  }

  protected async enroll(): Promise<void> {
    this.enrolling.set(true);
    try {
      this.course.set(await this.learning.enroll(this.courseId));
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.enrolling.set(false);
    }
  }

  protected async complete(lesson: LessonDetail): Promise<void> {
    if (lesson.completed || this.completing()) return;
    this.completing.set(true);
    try {
      const res = await this.learning.completeLesson(lesson.id);
      this.markComplete(lesson.id, res.progressPercent, res.courseCompleted);
      this.flashXp(res.xpEarned);
      const nx = this.nextLesson();
      if (nx && !res.courseCompleted) this.activeLessonId.set(nx.lesson.id);
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.completing.set(false);
    }
  }

  /** Patch the immutable course snapshot after a lesson completes. */
  private markComplete(lessonId: number, progressPercent: number, courseCompleted: boolean): void {
    const c = this.course();
    if (!c) return;
    this.course.set({
      ...c,
      progressPercent,
      completed: courseCompleted,
      modules: c.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, completed: true } : l)),
      })),
    });
  }

  private flashXp(amount: number): void {
    this.xpFlash.set(amount);
    setTimeout(() => this.xpFlash.set(null), 1500);
  }

  private firstUnfinished(c: CourseDetail): number | null {
    for (const m of c.modules) for (const l of m.lessons) if (!l.completed) return l.id;
    return null;
  }
}
