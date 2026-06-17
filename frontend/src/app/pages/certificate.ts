import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LearningService } from '../core/courses/learning.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { ApiError } from '../core/api/api-error';
import { CertificateDto } from '../core/models';
import { Spinner } from '../shared/ui/spinner';
import { ErrorState } from '../shared/ui/error-state';

/** Printable certificate awarded on 100% course completion. */
@Component({
  selector: 'll-certificate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, TPipe, Spinner, ErrorState],
  template: `
    @if (loading()) {
      <div class="grid place-items-center py-32"><ll-spinner [size]="28" /></div>
    } @else if (error()) {
      <div class="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <ll-error-state [message]="error()" (retry)="load()" />
      </div>
    } @else if (cert(); as c) {
      <section class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <!-- Certificate sheet -->
        <div
          class="cert relative overflow-hidden rounded-3xl border-2 border-grow-600 bg-white p-8 text-center shadow-lg sm:p-12"
        >
          <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.grow.50),transparent_60%)]"></div>
          <div class="relative">
            <span class="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-grow-600 text-white">
              <lucide-icon name="award" class="h-8 w-8" />
            </span>
            <p class="font-mono text-xs uppercase tracking-[0.3em] text-grow-600">
              {{ 'cert.title' | t }}
            </p>
            <p class="mt-6 text-sm text-ink-400">{{ 'cert.awardedTo' | t }}</p>
            <h1 class="mt-1 text-3xl font-extrabold text-ink-900">{{ c.studentName }}</h1>
            <p class="mt-4 text-sm text-ink-400">{{ 'cert.completed' | t }}</p>
            <h2 class="mt-1 text-xl font-extrabold text-grow-600">{{ c.courseTitle }}</h2>

            <div class="mx-auto mt-8 flex max-w-sm items-center justify-between border-t border-ink-200 pt-5 text-left">
              <div>
                <p class="text-[11px] uppercase tracking-wide text-ink-400">{{ 'cert.instructor' | t }}</p>
                <p class="font-extrabold">{{ c.instructorName }}</p>
              </div>
              <div class="text-right">
                <p class="text-[11px] uppercase tracking-wide text-ink-400">{{ 'cert.issued' | t }}</p>
                <p class="num font-extrabold">{{ issued() }}</p>
              </div>
            </div>
            <div class="mt-6 flex items-center justify-center gap-1.5 text-grow-600">
              <lucide-icon name="infinity" class="h-4 w-4" />
              <span class="font-extrabold">LearnLoop</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            (click)="print()"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-grow-600 px-6 py-3 font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98]"
          >
            <lucide-icon name="award" class="h-4 w-4" />
            {{ 'cert.download' | t }}
          </button>
          <a
            [routerLink]="['/course', c.courseId]"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-6 py-3 font-extrabold text-ink-900 transition-colors hover:border-grow-600"
          >
            {{ 'quiz.backToCourse' | t }}
          </a>
        </div>
      </section>
    }
  `,
  styles: `
    @media print {
      :host { display: block; }
      .cert { box-shadow: none; }
    }
  `,
})
export class Certificate {
  private readonly learning = inject(LearningService);
  private readonly i18n = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly cert = signal<CertificateDto | null>(null);

  private readonly courseId = Number(this.route.snapshot.paramMap.get('id'));

  protected issued(): string {
    const raw = this.cert()?.issuedAt;
    if (!raw) return '';
    const d = new Date(raw);
    return isNaN(d.getTime())
      ? raw
      : d.toLocaleDateString(this.i18n.lang() === 'es' ? 'es-ES' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  }

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.cert.set(await this.learning.certificate(this.courseId));
    } catch (err) {
      this.error.set(ApiError.from(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  protected print(): void {
    if (typeof window !== 'undefined') window.print();
  }
}
