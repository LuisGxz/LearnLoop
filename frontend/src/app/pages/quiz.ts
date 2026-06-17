import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { QuizService } from '../core/courses/quiz.service';
import { AuthService } from '../core/auth/auth.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { Answer, OptionView, QuestionView, QuizResult, QuizView } from '../core/models';
import { Spinner } from '../shared/ui/spinner';
import { ErrorState } from '../shared/ui/error-state';

const CONFETTI = [
  { left: 8, color: '#46B96A', delay: 0 },
  { left: 20, color: '#F5A623', delay: 0.4 },
  { left: 33, color: '#9C5FD4', delay: 0.9 },
  { left: 47, color: '#46B96A', delay: 0.2 },
  { left: 58, color: '#F5A623', delay: 1.1 },
  { left: 70, color: '#9C5FD4', delay: 0.6 },
  { left: 82, color: '#46B96A', delay: 1.4 },
  { left: 92, color: '#F5A623', delay: 0.3 },
];

/** Screen 3 — interactive quiz: answer with progress dots, then graded result. */
@Component({
  selector: 'll-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, TPipe, Spinner, ErrorState],
  template: `
    @if (loading()) {
      <div class="grid place-items-center py-32"><ll-spinner [size]="28" /></div>
    } @else if (error()) {
      <div class="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <ll-error-state [message]="error()" (retry)="load()" />
      </div>
    } @else if (quiz(); as q) {
      <section class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p class="mb-6 font-mono text-xs uppercase tracking-widest text-grow-600">
          {{ q.title }}
        </p>

        @if (!result()) {
          <!-- ── Answering ─────────────────────────────────────────── -->
          @if (current(); as cq) {
            <div class="rounded-3xl border border-ink-200 bg-white p-6">
              <div class="mb-5 flex items-center justify-between">
                <span class="num text-xs font-extrabold text-ink-400">
                  {{ 'quiz.question' | t }} {{ index() + 1 }} {{ 'quiz.of' | t }} {{ q.questions.length }}
                </span>
                <div class="flex gap-1.5">
                  @for (dot of q.questions; track $index) {
                    <span
                      class="h-2 w-6 rounded-full transition-colors"
                      [class]="
                        $index < index()
                          ? 'bg-grow-500'
                          : $index === index()
                            ? 'bg-ink-900'
                            : 'bg-ink-200'
                      "
                    ></span>
                  }
                </div>
              </div>

              <h2 class="mb-5 text-lg font-extrabold">{{ cq.text }}</h2>

              <div class="space-y-3">
                @for (opt of cq.options; track opt.id) {
                  <button
                    type="button"
                    (click)="choose(cq.id, opt.id)"
                    class="flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left text-sm font-bold transition-colors"
                    [class]="
                      selected(cq.id) === opt.id
                        ? 'border-grow-600 bg-grow-50'
                        : 'border-ink-200 hover:border-ink-900'
                    "
                  >
                    <span>{{ opt.text }}</span>
                    @if (selected(cq.id) === opt.id) {
                      <lucide-icon name="check" class="h-5 w-5 shrink-0 text-grow-600" />
                    }
                  </button>
                }
              </div>

              <button
                type="button"
                (click)="advance()"
                [disabled]="selected(cq.id) == null || submitting()"
                class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-4 font-extrabold text-white transition-all hover:bg-ink-600 active:scale-[0.99] disabled:opacity-50"
              >
                @if (submitting()) { <ll-spinner [size]="18" label="Submitting" /> }
                {{ isLast() ? ('quiz.finish' | t) : ('quiz.next' | t) }}
                @if (!isLast() && !submitting()) {
                  <lucide-icon name="arrow-left" class="h-4 w-4 rotate-180" />
                }
              </button>
            </div>
          }
        } @else if (result(); as r) {
          <!-- ── Result: achievement + review ──────────────────────── -->
          <div class="relative overflow-hidden rounded-3xl bg-ink-900 p-8 text-center text-white">
            @if (r.passed) {
              <div class="confetti pointer-events-none absolute inset-x-0 top-0 h-32">
                @for (c of confetti; track $index) {
                  <span [style.left.%]="c.left" [style.background]="c.color" [style.animation-delay.s]="c.delay"></span>
                }
              </div>
            }
            <div
              class="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full shadow-[0_0_0_10px_rgba(245,166,35,.15)]"
              [class]="r.passed ? 'bg-sun-500' : 'bg-ink-600'"
            >
              <lucide-icon [name]="r.passed ? 'trophy' : 'flag'" class="h-9 w-9 text-white" />
            </div>
            <h2 class="mb-1 text-2xl font-extrabold">
              {{ r.passed ? ('quiz.complete' | t) : ('quiz.incorrect' | t) }}
            </h2>
            <p class="num mb-6 text-sm text-white/70">
              {{ r.correctCount }}/{{ r.totalCount }} {{ 'quiz.correctCount' | t }} ·
              {{ r.passed ? '+' + r.xpEarned + ' XP' : ('quiz.failedMsg' | t) }}
            </p>

            <div class="mb-7 flex justify-center gap-3">
              <span class="rounded-2xl bg-white/10 px-4 py-3 text-center">
                <span class="num block text-xl font-extrabold">{{ r.score }}%</span>
                <span class="text-[11px] text-white/60">score</span>
              </span>
              <span class="rounded-2xl bg-white/10 px-4 py-3 text-center">
                <span class="num block text-xl font-extrabold">{{ auth.user()?.xp ?? r.totalXp }}</span>
                <span class="text-[11px] text-white/60">XP</span>
              </span>
              @if (r.newBadges.length) {
                <span class="rounded-2xl bg-white/10 px-4 py-3 text-center">
                  <span class="block text-xl font-extrabold">🏅</span>
                  <span class="text-[11px] text-white/60">{{ 'quiz.newBadge' | t }}</span>
                </span>
              }
            </div>

            @if (r.newBadges.length) {
              <div class="mb-6 flex flex-wrap justify-center gap-2">
                @for (badge of r.newBadges; track badge.code) {
                  <span class="rounded-full bg-sun-500/20 px-3 py-1.5 text-sm font-extrabold text-sun-100">
                    {{ badge.icon }} {{ badge.name }}
                  </span>
                }
              </div>
            }

            <div class="flex flex-col gap-2 sm:flex-row">
              @if (backToCourseId()) {
                <a
                  [routerLink]="['/course', backToCourseId()]"
                  class="flex-1 rounded-full bg-grow-500 py-4 font-extrabold text-white transition-all hover:bg-grow-400 active:scale-[0.99]"
                >
                  {{ 'quiz.backToCourse' | t }}
                </a>
              }
              @if (!r.passed) {
                <button
                  type="button"
                  (click)="retry()"
                  class="flex-1 rounded-full bg-white/10 py-4 font-extrabold text-white transition-colors hover:bg-white/20"
                >
                  {{ 'quiz.retry' | t }}
                </button>
              }
            </div>
          </div>

          <!-- Per-question review -->
          <div class="mt-6 space-y-3">
            @for (qr of r.questions; track qr.questionId; let i = $index) {
              <div class="rounded-2xl border border-ink-200 bg-white p-5">
                <div class="flex items-start gap-3">
                  <span
                    class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white"
                    [class]="qr.correct ? 'bg-grow-500' : 'bg-berry-500'"
                  >
                    <lucide-icon [name]="qr.correct ? 'check' : 'arrow-left'" class="h-4 w-4" [class.rotate-45]="!qr.correct" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="font-extrabold">{{ questionText(qr.questionId) }}</p>
                    <div class="mt-2 space-y-1.5 text-sm">
                      @for (opt of optionsOf(qr.questionId); track opt.id) {
                        <div
                          class="flex items-center gap-2 rounded-xl px-3 py-2"
                          [class]="optionClass(qr, opt)"
                        >
                          @if (opt.id === qr.correctOptionId) {
                            <lucide-icon name="check" class="h-4 w-4 shrink-0 text-grow-600" />
                          } @else if (opt.id === qr.chosenOptionId) {
                            <span class="grid h-4 w-4 shrink-0 place-items-center text-xs font-extrabold text-berry-500">✕</span>
                          } @else {
                            <span class="h-4 w-4 shrink-0"></span>
                          }
                          <span>{{ opt.text }}</span>
                        </div>
                      }
                    </div>
                    @if (qr.explanation) {
                      <div class="mt-3 flex gap-2 rounded-xl border border-grow-100 bg-grow-50 p-3">
                        <lucide-icon name="sparkles" class="h-4 w-4 shrink-0 text-grow-600" />
                        <p class="text-sm text-ink-600">{{ qr.explanation }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>
    }
  `,
  styles: `
    .confetti span {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      animation: confetti-fall 1.8s ease-in infinite;
    }
    @keyframes confetti-fall {
      0% { transform: translateY(-10px) rotate(0); opacity: 1; }
      100% { transform: translateY(140px) rotate(340deg); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .confetti span { animation: none; opacity: 0.6; }
    }
  `,
})
export class Quiz {
  protected readonly auth = inject(AuthService);
  private readonly i18n = inject(LanguageService);
  private readonly quizSvc = inject(QuizService);
  private readonly route = inject(ActivatedRoute);

  protected readonly confetti = CONFETTI;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly quiz = signal<QuizView | null>(null);
  protected readonly result = signal<QuizResult | null>(null);
  protected readonly submitting = signal(false);

  protected readonly index = signal(0);
  private readonly picks = signal<Record<number, number>>({});

  private readonly quizId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly backToCourseId = signal<number | null>(
    this.route.snapshot.queryParamMap.has('course')
      ? Number(this.route.snapshot.queryParamMap.get('course'))
      : null,
  );

  protected readonly current = computed<QuestionView | null>(
    () => this.quiz()?.questions[this.index()] ?? null,
  );
  protected readonly isLast = computed(
    () => this.index() === (this.quiz()?.questions.length ?? 0) - 1,
  );

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.quiz.set(await this.quizSvc.view(this.quizId));
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  protected selected(questionId: number): number | null {
    return this.picks()[questionId] ?? null;
  }

  protected choose(questionId: number, optionId: number): void {
    this.picks.set({ ...this.picks(), [questionId]: optionId });
  }

  protected advance(): void {
    if (this.isLast()) void this.submit();
    else this.index.set(this.index() + 1);
  }

  private async submit(): Promise<void> {
    this.submitting.set(true);
    try {
      const answers: Answer[] = Object.entries(this.picks()).map(([q, o]) => ({
        questionId: Number(q),
        optionId: o,
      }));
      this.result.set(await this.quizSvc.submit(this.quizId, answers));
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.submitting.set(false);
    }
  }

  protected retry(): void {
    this.picks.set({});
    this.index.set(0);
    this.result.set(null);
  }

  // ── Review helpers ───────────────────────────────────────────────────
  protected questionText(questionId: number): string {
    return this.quiz()?.questions.find((q) => q.id === questionId)?.text ?? '';
  }
  protected optionsOf(questionId: number): OptionView[] {
    return this.quiz()?.questions.find((q) => q.id === questionId)?.options ?? [];
  }
  protected optionClass(
    qr: { correctOptionId: number; chosenOptionId: number },
    opt: OptionView,
  ): string {
    if (opt.id === qr.correctOptionId) return 'bg-grow-50 font-bold text-grow-600';
    if (opt.id === qr.chosenOptionId) return 'bg-berry-100/50 font-bold text-berry-500 line-through';
    return 'text-ink-600';
  }
}
