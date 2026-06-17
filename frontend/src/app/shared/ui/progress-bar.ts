import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Animated progress bar. Width transitions; respects prefers-reduced-motion. */
@Component({
  selector: 'll-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3">
      <div
        class="h-2 flex-1 overflow-hidden rounded-full bg-ink-200"
        role="progressbar"
        [attr.aria-valuenow]="clamped()"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full rounded-full bg-grow-500 transition-[width] duration-700 ease-out"
          [style.width.%]="clamped()"
        ></div>
      </div>
      @if (showLabel()) {
        <span class="num text-xs font-extrabold text-grow-600">{{ clamped() }}%</span>
      }
    </div>
  `,
})
export class ProgressBar {
  readonly percent = input(0);
  readonly showLabel = input(true);
  protected readonly clamped = computed(() => Math.max(0, Math.min(100, Math.round(this.percent()))));
}
