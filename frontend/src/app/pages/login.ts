import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../core/auth/auth.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { Role } from '../core/models';
import { Spinner } from '../shared/ui/spinner';

type Mode = 'login' | 'register';

/** Orienting auth screen: sign in / register, role picker, demo quick-fill. */
@Component({
  selector: 'll-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideAngularModule, TPipe, Spinner],
  template: `
    <section class="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <!-- Form card -->
      <div class="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8">
        <div class="mb-6 flex rounded-full border border-ink-200 p-1 text-sm font-extrabold">
          @for (m of modes; track m) {
            <button
              type="button"
              (click)="setMode(m)"
              class="flex-1 rounded-full px-4 py-2 transition-colors"
              [class]="mode() === m ? 'bg-grow-600 text-white' : 'text-ink-600 hover:bg-ink-100'"
            >
              {{ (m === 'login' ? 'login.signInTab' : 'login.registerTab') | t }}
            </button>
          }
        </div>

        <h1 class="text-2xl font-extrabold">
          {{ (mode() === 'login' ? 'login.welcome' : 'login.join') | t }}
        </h1>
        <p class="mt-1 text-sm text-ink-600">{{ 'login.lead' | t }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4" novalidate>
          @if (mode() === 'register') {
            <div>
              <label class="mb-1 block text-sm font-bold" for="name">{{ 'login.name' | t }}</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="w-full rounded-2xl border-2 border-ink-200 px-4 py-3 font-bold outline-none transition-colors focus:border-grow-600"
                [class.border-berry-500]="fieldError('name')"
              />
              @if (fieldError('name'); as e) { <p class="mt-1 text-xs font-bold text-berry-500">{{ e }}</p> }
            </div>
          }

          <div>
            <label class="mb-1 block text-sm font-bold" for="email">{{ 'login.email' | t }}</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="w-full rounded-2xl border-2 border-ink-200 px-4 py-3 font-bold outline-none transition-colors focus:border-grow-600"
              [class.border-berry-500]="fieldError('email')"
            />
            @if (fieldError('email'); as e) { <p class="mt-1 text-xs font-bold text-berry-500">{{ e }}</p> }
          </div>

          <div>
            <label class="mb-1 block text-sm font-bold" for="password">{{ 'login.password' | t }}</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              [attr.autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'"
              class="w-full rounded-2xl border-2 border-ink-200 px-4 py-3 font-bold outline-none transition-colors focus:border-grow-600"
              [class.border-berry-500]="fieldError('password')"
            />
            @if (fieldError('password'); as e) { <p class="mt-1 text-xs font-bold text-berry-500">{{ e }}</p> }
          </div>

          @if (mode() === 'register') {
            <div>
              <span class="mb-1 block text-sm font-bold">{{ 'login.role' | t }}</span>
              <div class="grid grid-cols-2 gap-3">
                @for (r of roles; track r.value) {
                  <button
                    type="button"
                    (click)="role.set(r.value)"
                    class="rounded-2xl border-2 p-3 text-left transition-colors"
                    [class]="role() === r.value ? 'border-grow-600 bg-grow-50' : 'border-ink-200 hover:border-ink-900'"
                  >
                    <span class="flex items-center gap-2 font-extrabold">
                      <lucide-icon [name]="r.icon" class="h-4 w-4 text-grow-600" />
                      {{ r.label | t }}
                    </span>
                  </button>
                }
              </div>
            </div>
          }

          @if (formError(); as e) {
            <p class="rounded-2xl bg-berry-100/60 px-4 py-3 text-sm font-bold text-berry-500">{{ e }}</p>
          }

          <button
            type="submit"
            [disabled]="busy()"
            class="flex w-full items-center justify-center gap-2 rounded-full bg-grow-600 py-3.5 font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.99] disabled:opacity-60"
          >
            @if (busy()) { <ll-spinner [size]="18" /> }
            {{ (mode() === 'login' ? 'login.submitSignIn' : 'login.submitRegister') | t }}
          </button>
        </form>

        <p style="margin-top:1.1rem;text-align:center;font-size:11px;line-height:1.5;opacity:.6;">
          ⏳ Free-tier demo — the backend may take ~30s to wake up on the first request.<br>
          Demo gratuita — el backend puede tardar ~30s en despertar en la primera petición.
        </p>
      </div>

      <!-- Orientation: demo accounts + what each role does -->
      <div class="flex flex-col gap-4">
        <div class="rounded-3xl border border-ink-200 bg-white p-6">
          <h2 class="flex items-center gap-2 font-extrabold">
            <lucide-icon name="sparkles" class="h-5 w-5 text-grow-600" />
            {{ 'login.demoTitle' | t }}
          </h2>
          <div class="mt-4 space-y-3">
            <button
              type="button"
              (click)="quickFill('student')"
              class="flex w-full items-start gap-3 rounded-2xl border border-ink-200 p-4 text-left transition-colors hover:border-grow-600"
            >
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-grow-100 text-grow-600">
                <lucide-icon name="graduation-cap" class="h-5 w-5" />
              </span>
              <span>
                <span class="block font-extrabold">{{ 'login.demoStudent' | t }}</span>
                <span class="block text-xs text-ink-600">{{ 'login.whatStudent' | t }}</span>
              </span>
            </button>
            <button
              type="button"
              (click)="quickFill('instructor')"
              class="flex w-full items-start gap-3 rounded-2xl border border-ink-200 p-4 text-left transition-colors hover:border-grow-600"
            >
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-berry-100 text-berry-500">
                <lucide-icon name="pencil" class="h-5 w-5" />
              </span>
              <span>
                <span class="block font-extrabold">{{ 'login.demoInstructor' | t }}</span>
                <span class="block text-xs text-ink-600">{{ 'login.whatInstructor' | t }}</span>
              </span>
            </button>
          </div>
        </div>

        <div class="flex gap-3 rounded-3xl border border-grow-100 bg-grow-50 p-5">
          <lucide-icon name="sparkles" class="h-5 w-5 shrink-0 text-grow-600" />
          <p class="text-sm text-ink-600">{{ 'login.demoHint' | t }}</p>
        </div>
      </div>
    </section>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly modes: Mode[] = ['login', 'register'];
  protected readonly roles = [
    { value: 'STUDENT' as Role, label: 'login.roleLearn' as const, icon: 'graduation-cap' },
    { value: 'INSTRUCTOR' as Role, label: 'login.roleTeach' as const, icon: 'pencil' },
  ];

  protected readonly mode = signal<Mode>('login');
  protected readonly role = signal<Role>('STUDENT');
  protected readonly busy = signal(false);
  protected readonly formError = signal<string | null>(null);
  private readonly fieldErrors = signal<Record<string, string>>({});

  protected readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly redirect = computed(
    () => this.route.snapshot.queryParamMap.get('redirect') ?? null,
  );

  protected setMode(m: Mode): void {
    this.mode.set(m);
    this.formError.set(null);
    this.fieldErrors.set({});
  }

  protected fieldError(name: string): string | undefined {
    return this.fieldErrors()[name];
  }

  protected quickFill(kind: 'student' | 'instructor'): void {
    this.setMode('login');
    const email = kind === 'student' ? 'student@learnloop.dev' : 'instructor@learnloop.dev';
    this.form.patchValue({ email, password: 'Demo1234!' });
  }

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    this.formError.set(null);
    this.fieldErrors.set({});

    const { name, email, password } = this.form.getRawValue();
    if (this.mode() === 'register' && !name.trim()) {
      this.fieldErrors.set({ name: this.i18n.t('login.name') + ' —' });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.busy.set(true);
    try {
      const user =
        this.mode() === 'login'
          ? await this.auth.login({ email, password })
          : await this.auth.register({ name, email, password, role: this.role() });
      await this.router.navigateByUrl(this.redirect() ?? this.home(user.role));
    } catch (err) {
      const apiErr = ApiError.from(err);
      this.fieldErrors.set(apiErr.fields);
      if (Object.keys(apiErr.fields).length === 0) this.formError.set(apiErr.message);
    } finally {
      this.busy.set(false);
    }
  }

  private home(role: Role): string {
    return role === 'INSTRUCTOR' ? '/teach' : '/learning';
  }
}
