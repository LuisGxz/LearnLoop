import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shimmer placeholder block. Compose several to mimic a card while loading. */
@Component({
  selector: 'll-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="block animate-pulse rounded-xl bg-ink-200/70" [style.height]="height()"></span>`,
  styles: `:host { display: block; }`,
})
export class Skeleton {
  readonly height = input('1rem');
}
