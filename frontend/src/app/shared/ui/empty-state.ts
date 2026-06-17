import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Friendly empty state. Title/body teach what to do next; project content for
 * a call-to-action button.
 */
@Component({
  selector: 'll-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span class="grid h-14 w-14 place-items-center rounded-2xl bg-grow-100 text-grow-600">
        <lucide-icon [name]="icon()" class="h-7 w-7" />
      </span>
      <h3 class="text-lg font-extrabold text-ink-900">{{ title() }}</h3>
      <p class="max-w-sm text-sm text-ink-600">{{ body() }}</p>
      <div class="mt-1"><ng-content /></div>
    </div>
  `,
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly title = input('Nothing here yet');
  readonly body = input('Come back once there is something to show.');
}
