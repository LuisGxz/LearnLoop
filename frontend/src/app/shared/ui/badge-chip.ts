import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * A gamification badge pill (icon + label). `tone` picks the accent: sun for
 * streak/achievement, berry for XP, grow for course completion.
 */
@Component({
  selector: 'll-badge-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold"
      [class]="toneClass()"
    >
      <lucide-icon [name]="icon()" class="h-4 w-4" />
      <span><ng-content /></span>
    </span>
  `,
})
export class BadgeChip {
  readonly icon = input('award');
  readonly tone = input<'grow' | 'sun' | 'berry'>('grow');

  protected toneClass(): string {
    return {
      grow: 'bg-grow-100 text-grow-600',
      sun: 'bg-sun-100 text-sun-500',
      berry: 'bg-berry-100 text-berry-500',
    }[this.tone()];
  }
}
