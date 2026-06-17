import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

/** EN/ES segmented toggle wired to LanguageService. */
@Component({
  selector: 'll-lang-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex overflow-hidden rounded-full border border-ink-200 text-xs font-extrabold">
      @for (l of langs; track l) {
        <button
          type="button"
          (click)="i18n.set(l)"
          class="px-3 py-1.5 uppercase transition-colors"
          [class]="i18n.lang() === l ? 'bg-grow-600 text-white' : 'text-ink-600 hover:bg-ink-100'"
          [attr.aria-pressed]="i18n.lang() === l"
        >
          {{ l }}
        </button>
      }
    </div>
  `,
})
export class LangToggle {
  protected readonly i18n = inject(LanguageService);
  protected readonly langs = ['en', 'es'] as const;
}
