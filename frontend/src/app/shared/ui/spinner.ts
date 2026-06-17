import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/** Inline loading spinner. */
@Component({
  selector: 'll-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <lucide-icon
      name="loader-circle"
      [style.width.px]="size()"
      [style.height.px]="size()"
      class="animate-spin text-grow-600"
      [attr.aria-label]="label()"
      role="status"
    />
  `,
})
export class Spinner {
  readonly size = input(20);
  readonly label = input('Loading');
}
