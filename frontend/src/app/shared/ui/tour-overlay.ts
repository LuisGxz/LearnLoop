import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TourService } from '../../core/demo/tour.service';
import { LanguageService } from '../../core/i18n/language.service';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Renders the active tour step: a spotlight cutout + a clamped tooltip card. */
@Component({
  selector: 'll-tour-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    @if (tour.active() && tour.step(); as s) {
      <div class="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
        <!-- Spotlight (box-shadow cutout) or full dim when no target -->
        @if (rect(); as r) {
          <div
            class="pointer-events-none absolute rounded-2xl ring-2 ring-grow-500 transition-all duration-300"
            [style.top.px]="r.top - 6"
            [style.left.px]="r.left - 6"
            [style.width.px]="r.width + 12"
            [style.height.px]="r.height + 12"
            style="box-shadow: 0 0 0 9999px rgba(15, 23, 18, 0.6);"
          ></div>
        } @else {
          <div class="absolute inset-0 bg-ink-900/60"></div>
        }

        <!-- Tooltip card -->
        <div
          class="absolute w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white p-5 shadow-2xl transition-all duration-300"
          [style.top.px]="cardTop()"
          [style.left.px]="cardLeft()"
        >
          <p class="text-[11px] font-extrabold uppercase tracking-wide text-grow-600">
            {{ tour.index() + 1 }} / {{ tour.steps().length }}
          </p>
          <h3 class="mt-1 text-lg font-extrabold">{{ es() ? s.title.es : s.title.en }}</h3>
          <p class="mt-2 text-sm text-ink-600">{{ es() ? s.body.es : s.body.en }}</p>
          <div class="mt-4 flex items-center justify-between">
            <button type="button" (click)="tour.finish()" class="text-sm font-bold text-ink-400 hover:text-ink-600">
              {{ es() ? 'Saltar' : 'Skip' }}
            </button>
            <div class="flex gap-2">
              @if (tour.index() > 0) {
                <button
                  type="button"
                  (click)="tour.prev()"
                  class="rounded-full border border-ink-200 px-4 py-2 text-sm font-extrabold transition-colors hover:border-grow-600"
                >
                  {{ es() ? 'Atrás' : 'Back' }}
                </button>
              }
              <button
                type="button"
                (click)="tour.next()"
                class="inline-flex items-center gap-1.5 rounded-full bg-grow-600 px-4 py-2 text-sm font-extrabold text-white transition-all hover:bg-grow-500"
              >
                {{ tour.isLast() ? (es() ? 'Listo' : 'Done') : es() ? 'Siguiente' : 'Next' }}
                @if (!tour.isLast()) { <lucide-icon name="arrow-left" class="h-4 w-4 rotate-180" /> }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class TourOverlay {
  protected readonly tour = inject(TourService);
  private readonly i18n = inject(LanguageService);
  protected readonly es = this.i18n.isSpanish;

  protected readonly rect = signal<Rect | null>(null);
  protected readonly cardTop = signal(120);
  protected readonly cardLeft = signal(24);

  constructor() {
    const onChange = () => this.reposition();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onChange, { passive: true });
      window.addEventListener('scroll', onChange, { passive: true, capture: true });
      inject(DestroyRef).onDestroy(() => {
        window.removeEventListener('resize', onChange);
        window.removeEventListener('scroll', onChange, { capture: true } as EventListenerOptions);
      });
    }
    // Recompute whenever the active step changes.
    effect(() => {
      this.tour.active();
      this.tour.index();
      if (typeof window !== 'undefined') requestAnimationFrame(() => this.reposition());
    });
  }

  private reposition(): void {
    const step = this.tour.step();
    if (!this.tour.active() || !step) return;

    const el = step.target ? (document.querySelector(step.target) as HTMLElement | null) : null;
    if (!el) {
      this.rect.set(null);
      this.cardTop.set(Math.max(24, window.innerHeight / 2 - 120));
      this.cardLeft.set(Math.max(16, window.innerWidth / 2 - 176));
      return;
    }

    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const r = el.getBoundingClientRect();
    this.rect.set({ top: r.top, left: r.left, width: r.width, height: r.height });

    const cardW = Math.min(352, window.innerWidth - 32);
    const cardH = 200;
    // Prefer below the target; flip above if there's no room.
    let top = r.bottom + 16;
    if (top + cardH > window.innerHeight - 16) top = Math.max(16, r.top - cardH - 16);
    let left = r.left + r.width / 2 - cardW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));
    this.cardTop.set(top);
    this.cardLeft.set(left);
  }
}
