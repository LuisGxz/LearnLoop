import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../core/i18n/language.service';
import { EmptyState } from '../shared/ui/empty-state';

/**
 * Honest stand-in for sections built in later phases. Reads its label from
 * route data so nav links resolve without dead ends.
 */
@Component({
  selector: 'll-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <ll-empty-state
        icon="sparkles"
        [title]="title"
        [body]="es() ? 'Esta sección llega en una fase próxima.' : 'This section lands in an upcoming phase.'"
      />
    </section>
  `,
})
export class Placeholder {
  private readonly i18n = inject(LanguageService);
  protected readonly es = this.i18n.isSpanish;
  protected readonly title = inject(ActivatedRoute).snapshot.data['title'] ?? 'Coming soon';
}
