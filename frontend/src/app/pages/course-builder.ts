import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CourseService } from '../core/courses/course.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { CourseDetail, CourseInput, LessonType } from '../core/models';
import { coverGradient } from '../shared/cover-gradient';
import { Spinner } from '../shared/ui/spinner';
import { ErrorState } from '../shared/ui/error-state';

const COVERS = ['t-1', 't-2', 't-3', 't-4'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TYPES: LessonType[] = ['VIDEO', 'TEXT'];

/** Instructor course builder: nested modules → lessons → optional quiz. */
@Component({
  selector: 'll-course-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, TPipe, Spinner, ErrorState],
  template: `
    @if (loading()) {
      <div class="grid place-items-center py-32"><ll-spinner [size]="28" /></div>
    } @else if (loadError()) {
      <div class="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <ll-error-state [message]="loadError()" (retry)="load()" />
      </div>
    } @else {
      <section class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <a
          routerLink="/teach"
          class="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink-600 transition-colors hover:text-grow-600"
        >
          <lucide-icon name="arrow-left" class="h-4 w-4" />{{ 'teach.title' | t }}
        </a>
        <h1 class="text-2xl font-extrabold">
          {{ (editId ? 'build.editTitle' : 'build.newTitle') | t }}
        </h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-6" novalidate>
          <!-- Basics -->
          <div class="rounded-3xl border border-ink-200 bg-white p-5">
            <h2 class="mb-4 font-extrabold">{{ 'build.basics' | t }}</h2>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-bold">{{ 'build.title' | t }}</label>
                <input formControlName="title" [class]="inputCls" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-bold">{{ 'build.description' | t }}</label>
                <textarea formControlName="description" rows="3" [class]="inputCls"></textarea>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-bold">{{ 'build.category' | t }}</label>
                  <input formControlName="category" [class]="inputCls" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-bold">{{ 'build.level' | t }}</label>
                  <select formControlName="level" [class]="inputCls">
                    @for (l of levels; track l) { <option [value]="l">{{ l }}</option> }
                  </select>
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-bold">{{ 'build.cover' | t }}</label>
                <div class="flex gap-3">
                  @for (cov of covers; track cov) {
                    <button
                      type="button"
                      (click)="form.controls.coverGradient.setValue(cov)"
                      class="h-12 w-16 rounded-xl ring-2 ring-offset-2 transition-all"
                      [style.background]="grad(cov)"
                      [class]="form.controls.coverGradient.value === cov ? 'ring-grow-600' : 'ring-transparent'"
                      [attr.aria-label]="cov"
                    ></button>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Modules -->
          <div class="space-y-4" formArrayName="modules">
            <div class="flex items-center justify-between">
              <h2 class="font-extrabold">{{ 'build.modules' | t }}</h2>
              <button type="button" (click)="addModule()" class="btn-ghost">
                <lucide-icon name="circle-plus" class="h-4 w-4" />{{ 'build.addModule' | t }}
              </button>
            </div>

            @for (m of modules.controls; track m; let mi = $index) {
              <div [formGroupName]="mi" class="rounded-3xl border border-ink-200 bg-white p-5">
                <div class="flex items-center gap-3">
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-grow-100 text-sm font-extrabold text-grow-600">
                    {{ mi + 1 }}
                  </span>
                  <input formControlName="title" [placeholder]="('build.moduleTitle' | t)" [class]="inputCls" />
                  <button type="button" (click)="removeModule(mi)" class="btn-icon" [attr.aria-label]="('build.remove' | t)">
                    <lucide-icon name="trash-2" class="h-4 w-4" />
                  </button>
                </div>

                <!-- Lessons -->
                <div class="mt-4 space-y-3" formArrayName="lessons">
                  <p class="text-xs font-extrabold uppercase tracking-wide text-ink-400">{{ 'build.lessons' | t }}</p>
                  @for (l of lessons(mi).controls; track l; let li = $index) {
                    <div [formGroupName]="li" class="rounded-2xl border border-ink-200 bg-ink-50/50 p-3">
                      <div class="flex items-center gap-2">
                        <input formControlName="title" [placeholder]="('build.lessonTitle' | t)" [class]="inputSm" />
                        <button type="button" (click)="removeLesson(mi, li)" class="btn-icon" [attr.aria-label]="('build.remove' | t)">
                          <lucide-icon name="trash-2" class="h-4 w-4" />
                        </button>
                      </div>
                      <div class="mt-2 grid grid-cols-2 gap-2">
                        <select formControlName="type" [class]="inputSm">
                          @for (t of types; track t) {
                            <option [value]="t">{{ (t === 'VIDEO' ? 'course.lessonType.video' : 'course.lessonType.text') | t }}</option>
                          }
                        </select>
                        <input type="number" formControlName="durationMin" min="1" [placeholder]="('build.duration' | t)" [class]="inputSm" />
                      </div>
                      <textarea formControlName="content" rows="2" [placeholder]="('build.content' | t)" [class]="inputSm + ' mt-2'"></textarea>
                    </div>
                  }
                  <button type="button" (click)="addLesson(mi)" class="btn-ghost">
                    <lucide-icon name="circle-plus" class="h-4 w-4" />{{ 'build.addLesson' | t }}
                  </button>
                </div>

                <!-- Quiz -->
                <div class="mt-4 border-t border-ink-200 pt-4">
                  @if (!hasQuiz(mi)) {
                    <button type="button" (click)="addQuiz(mi)" class="btn-ghost">
                      <lucide-icon name="circle-plus" class="h-4 w-4" />{{ 'build.addQuiz' | t }}
                    </button>
                  } @else {
                    <div formGroupName="quiz" class="rounded-2xl border border-berry-100 bg-berry-100/20 p-3">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-extrabold uppercase tracking-wide text-berry-500">{{ 'build.quiz' | t }}</p>
                        <button type="button" (click)="removeQuiz(mi)" class="text-xs font-bold text-berry-500 hover:underline">
                          {{ 'build.removeQuiz' | t }}
                        </button>
                      </div>
                      <div class="mt-2 grid grid-cols-[1fr_auto] gap-2">
                        <input formControlName="title" [placeholder]="('build.quizTitle' | t)" [class]="inputSm" />
                        <div class="flex items-center gap-1">
                          <input type="number" formControlName="passingScore" min="0" max="100" class="w-16 rounded-xl border-2 border-ink-200 px-2 py-2 text-sm font-bold outline-none focus:border-grow-600" />
                          <span class="text-xs font-bold text-ink-400">% {{ 'quiz.passingScore' | t }}</span>
                        </div>
                      </div>

                      <div class="mt-3 space-y-3" formArrayName="questions">
                        @for (q of questions(mi).controls; track q; let qi = $index) {
                          <div [formGroupName]="qi" class="rounded-xl border border-ink-200 bg-white p-3">
                            <div class="flex items-center gap-2">
                              <input formControlName="text" [placeholder]="('build.questionText' | t)" [class]="inputSm" />
                              <button type="button" (click)="removeQuestion(mi, qi)" class="btn-icon" [attr.aria-label]="('build.remove' | t)">
                                <lucide-icon name="trash-2" class="h-4 w-4" />
                              </button>
                            </div>
                            <div class="mt-2 space-y-1.5" formArrayName="options">
                              @for (o of options(mi, qi).controls; track o; let oi = $index) {
                                <div [formGroupName]="oi" class="flex items-center gap-2">
                                  <button
                                    type="button"
                                    (click)="markCorrect(mi, qi, oi)"
                                    class="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors"
                                    [class]="o.value.correct ? 'border-grow-600 bg-grow-600 text-white' : 'border-ink-200'"
                                    [attr.aria-label]="('build.markCorrect' | t)"
                                  >
                                    @if (o.value.correct) { <lucide-icon name="check" class="h-3.5 w-3.5" /> }
                                  </button>
                                  <input formControlName="text" [placeholder]="('build.options' | t)" [class]="inputSm" />
                                  <button type="button" (click)="removeOption(mi, qi, oi)" class="btn-icon" [attr.aria-label]="('build.remove' | t)">
                                    <lucide-icon name="trash-2" class="h-4 w-4" />
                                  </button>
                                </div>
                              }
                              <button type="button" (click)="addOption(mi, qi)" class="btn-ghost text-xs">
                                <lucide-icon name="circle-plus" class="h-3.5 w-3.5" />{{ 'build.addOption' | t }}
                              </button>
                            </div>
                            <input formControlName="explanation" [placeholder]="('build.explanation' | t)" [class]="inputSm + ' mt-2'" />
                          </div>
                        }
                        <button type="button" (click)="addQuestion(mi)" class="btn-ghost text-xs">
                          <lucide-icon name="circle-plus" class="h-3.5 w-3.5" />{{ 'build.addQuestion' | t }}
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          @if (formError(); as e) {
            <p class="rounded-2xl bg-berry-100/60 px-4 py-3 text-sm font-bold text-berry-500">{{ e }}</p>
          }

          <div class="flex gap-3">
            <button
              type="submit"
              [disabled]="saving()"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-grow-600 px-6 py-3 font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98] disabled:opacity-60"
            >
              @if (saving()) { <ll-spinner [size]="18" /> }
              {{ (saving() ? 'build.saving' : 'build.save') | t }}
            </button>
            <a routerLink="/teach" class="rounded-full border border-ink-200 px-6 py-3 font-extrabold text-ink-900 transition-colors hover:border-grow-600">
              {{ 'build.cancel' | t }}
            </a>
          </div>
        </form>
      </section>
    }
  `,
  styles: `
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 0.375rem;
      border-radius: 9999px; padding: 0.5rem 1rem;
      font-size: 0.8125rem; font-weight: 800;
      color: var(--color-grow-600); transition: background-color 0.15s;
    }
    .btn-ghost:hover { background: var(--color-grow-100); }
    .btn-icon {
      display: grid; place-items: center; flex-shrink: 0;
      height: 2.25rem; width: 2.25rem; border-radius: 0.75rem;
      color: var(--color-ink-400); transition: color 0.15s, background-color 0.15s;
    }
    .btn-icon:hover { color: var(--color-berry-500); background: var(--color-berry-100); }
  `,
})
export class CourseBuilder {
  private readonly fb = inject(FormBuilder);
  private readonly courseSvc = inject(CourseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly covers = COVERS;
  protected readonly levels = LEVELS;
  protected readonly types = TYPES;
  protected readonly grad = coverGradient;

  protected readonly inputCls =
    'w-full rounded-2xl border-2 border-ink-200 px-4 py-3 font-bold outline-none transition-colors focus:border-grow-600 bg-white';
  protected readonly inputSm =
    'w-full rounded-xl border-2 border-ink-200 px-3 py-2 text-sm font-bold outline-none transition-colors focus:border-grow-600 bg-white';

  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  // bump to re-read quiz presence in template after structural changes
  private readonly rev = signal(0);

  protected readonly editId = this.route.snapshot.paramMap.has('id')
    ? Number(this.route.snapshot.paramMap.get('id'))
    : null;

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    category: ['', Validators.required],
    level: ['Beginner', Validators.required],
    coverGradient: ['t-1', Validators.required],
    modules: this.fb.array<FormGroup>([]),
  });

  get modules(): FormArray<FormGroup> {
    return this.form.controls.modules;
  }

  constructor() {
    if (this.editId) void this.load();
    else this.addModule();
  }

  // ── Load (edit) ──────────────────────────────────────────────────────
  protected async load(): Promise<void> {
    if (!this.editId) return;
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.hydrate(await this.courseSvc.detail(this.editId));
    } catch (err) {
      this.loadError.set(ApiError.from(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  private hydrate(c: CourseDetail): void {
    this.form.patchValue({
      title: c.title,
      description: c.description,
      category: c.category,
      level: c.level,
      coverGradient: c.coverGradient,
    });
    this.modules.clear();
    for (const m of c.modules) {
      const mg = this.moduleGroup(m.title);
      const lessons = mg.get('lessons') as FormArray<FormGroup>;
      for (const l of m.lessons) {
        lessons.push(this.lessonGroup(l.title, l.type, l.durationMin, l.content));
      }
      if (m.quiz) {
        // Course detail carries quiz meta only (not the questions/answers, which
        // the quiz-taking endpoint intentionally withholds). On edit we seed the
        // quiz title + a starter question so the instructor can re-author it.
        mg.setControl('quiz', this.quizGroupBuild(m.quiz.title, 70));
      }
      this.modules.push(mg);
    }
    this.rev.set(this.rev() + 1);
  }

  // ── Builders ─────────────────────────────────────────────────────────
  private moduleGroup(title = ''): FormGroup {
    return this.fb.group({
      title: [title, Validators.required],
      lessons: this.fb.array<FormGroup>([this.lessonGroup()]),
    });
  }
  private lessonGroup(title = '', type: LessonType = 'VIDEO', durationMin = 5, content = ''): FormGroup {
    return this.fb.group({
      title: [title, Validators.required],
      type: [type, Validators.required],
      durationMin: [durationMin, [Validators.required, Validators.min(1)]],
      content: [content],
    });
  }
  private quizGroupBuild(title = '', passingScore = 70): FormGroup {
    return this.fb.group({
      title: [title, Validators.required],
      passingScore: [passingScore, [Validators.required, Validators.min(0), Validators.max(100)]],
      questions: this.fb.array<FormGroup>([this.questionGroup()]),
    });
  }
  private questionGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      explanation: [''],
      options: this.fb.array<FormGroup>([this.optionGroup(true), this.optionGroup(false)]),
    });
  }
  private optionGroup(correct = false): FormGroup {
    return this.fb.group({ text: ['', Validators.required], correct: [correct] });
  }

  // ── Accessors ────────────────────────────────────────────────────────
  protected lessons(mi: number): FormArray<FormGroup> {
    return this.modules.at(mi).get('lessons') as FormArray<FormGroup>;
  }
  protected hasQuiz(mi: number): boolean {
    this.rev();
    return this.modules.at(mi).contains('quiz');
  }
  protected quizGroup(mi: number): FormGroup {
    return this.modules.at(mi).get('quiz') as FormGroup;
  }
  protected questions(mi: number): FormArray<FormGroup> {
    return this.quizGroup(mi).get('questions') as FormArray<FormGroup>;
  }
  protected options(mi: number, qi: number): FormArray<FormGroup> {
    return this.questions(mi).at(qi).get('options') as FormArray<FormGroup>;
  }

  // ── Mutations ────────────────────────────────────────────────────────
  protected addModule(): void {
    this.modules.push(this.moduleGroup());
  }
  protected removeModule(mi: number): void {
    this.modules.removeAt(mi);
  }
  protected addLesson(mi: number): void {
    this.lessons(mi).push(this.lessonGroup());
  }
  protected removeLesson(mi: number, li: number): void {
    this.lessons(mi).removeAt(li);
  }
  protected addQuiz(mi: number): void {
    this.modules.at(mi).setControl('quiz', this.quizGroupBuild());
    this.rev.set(this.rev() + 1);
  }
  protected removeQuiz(mi: number): void {
    this.modules.at(mi).removeControl('quiz');
    this.rev.set(this.rev() + 1);
  }
  protected addQuestion(mi: number): void {
    this.questions(mi).push(this.questionGroup());
  }
  protected removeQuestion(mi: number, qi: number): void {
    this.questions(mi).removeAt(qi);
  }
  protected addOption(mi: number, qi: number): void {
    this.options(mi, qi).push(this.optionGroup());
  }
  protected removeOption(mi: number, qi: number, oi: number): void {
    this.options(mi, qi).removeAt(oi);
  }
  protected markCorrect(mi: number, qi: number, oi: number): void {
    this.options(mi, qi).controls.forEach((o, i) => o.get('correct')!.setValue(i === oi));
  }

  // ── Submit ───────────────────────────────────────────────────────────
  protected async submit(): Promise<void> {
    if (this.saving()) return;
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set(this.firstInvalidMessage());
      return;
    }

    this.saving.set(true);
    try {
      const input = this.toInput();
      const saved = this.editId
        ? await this.courseSvc.update(this.editId, input)
        : await this.courseSvc.create(input);
      await this.router.navigate(['/course', saved.id]);
    } catch (err) {
      this.formError.set(ApiError.from(err).message);
    } finally {
      this.saving.set(false);
    }
  }

  private toInput(): CourseInput {
    const v = this.form.getRawValue();
    return {
      title: v.title,
      description: v.description,
      category: v.category,
      level: v.level,
      coverGradient: v.coverGradient,
      modules: this.modules.controls.map((mg) => {
        const quiz = mg.get('quiz') as FormGroup | null;
        return {
          title: mg.get('title')!.value,
          lessons: (mg.get('lessons') as FormArray<FormGroup>).controls.map((lg) => ({
            title: lg.get('title')!.value,
            type: lg.get('type')!.value,
            durationMin: Number(lg.get('durationMin')!.value),
            content: lg.get('content')!.value ?? '',
          })),
          quiz: quiz
            ? {
                title: quiz.get('title')!.value,
                passingScore: Number(quiz.get('passingScore')!.value),
                questions: (quiz.get('questions') as FormArray<FormGroup>).controls.map((qg) => ({
                  text: qg.get('text')!.value,
                  explanation: qg.get('explanation')!.value ?? '',
                  options: (qg.get('options') as FormArray<FormGroup>).controls.map((og) => ({
                    text: og.get('text')!.value,
                    correct: !!og.get('correct')!.value,
                  })),
                })),
              }
            : null,
        };
      }),
    };
  }

  private firstInvalidMessage(): string {
    return this.form.controls.modules.length === 0
      ? 'Add at least one module.'
      : 'Please complete the highlighted fields.';
  }
}
