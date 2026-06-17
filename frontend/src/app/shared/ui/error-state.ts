import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LanguageService } from '../../core/i18n/language.service';

/** Error panel with an optional retry. Pass the (already humanized) message. */
@Component({
  selector: 'll-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span class="grid h-14 w-14 place-items-center rounded-2xl bg-sun-100 text-sun-500">
        <lucide-icon name="triangle-alert" class="h-7 w-7" />
      </span>
      <h3 class="text-lg font-extrabold text-ink-900">{{ i18n.t('state.error.title') }}</h3>
      <p class="max-w-sm text-sm text-ink-600">{{ message() || i18n.t('state.offline') }}</p>
      <button
        type="button"
        (click)="retry.emit()"
        class="mt-1 rounded-full bg-grow-600 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98]"
      >
        {{ i18n.t('state.error.retry') }}
      </button>
    </div>
  `,
})
export class ErrorState {
  protected readonly i18n = inject(LanguageService);
  readonly message = input<string | null>(null);
  readonly retry = output<void>();
}
