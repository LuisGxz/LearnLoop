import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../core/auth/auth.service';
import { LanguageService } from '../core/i18n/language.service';
import { TPipe } from '../core/i18n/t.pipe';
import { CopyKey } from '../core/i18n/copy';
import { LangToggle } from '../shared/ui/lang-toggle';

interface NavItem {
  path: string;
  label: CopyKey;
  exact: boolean;
}

/** Global sticky header: brand, role-aware nav, streak/XP chips, account menu. */
@Component({
  selector: 'll-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, TPipe, LangToggle],
  template: `
    <header class="sticky top-0 z-50 border-b border-ink-200 bg-ink-50/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <!-- Brand -->
        <a routerLink="/" class="flex items-center gap-2.5">
          <span class="grid h-8 w-8 place-items-center rounded-xl bg-grow-600 text-white">
            <lucide-icon name="infinity" class="h-4 w-4" />
          </span>
          <span class="text-lg font-extrabold tracking-tight">LearnLoop</span>
        </a>

        <!-- Primary nav -->
        <nav class="hidden items-center gap-1 md:flex">
          @for (item of nav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-grow-100 text-grow-600"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="rounded-full px-3.5 py-2 text-sm font-bold text-ink-600 transition-colors hover:bg-ink-100"
            >
              {{ item.label | t }}
            </a>
          }
        </nav>

        <!-- Right cluster -->
        <div class="flex items-center gap-2.5">
          @if (auth.isAuthenticated()) {
            <span
              class="hidden items-center gap-1.5 rounded-full bg-sun-100 px-3 py-1.5 text-sm font-extrabold text-sun-500 sm:flex"
              [title]="('chip.streak' | t)"
            >
              <lucide-icon name="flame" class="h-4 w-4" />
              <span class="num">{{ auth.user()!.streakDays }}</span>
            </span>
            <span
              class="hidden items-center gap-1.5 rounded-full bg-berry-100 px-3 py-1.5 text-sm font-extrabold text-berry-500 sm:flex"
            >
              <lucide-icon name="gem" class="h-4 w-4" />
              <span class="num">{{ auth.user()!.xp }}</span> {{ 'chip.xp' | t }}
            </span>

            <!-- Account menu -->
            <div class="relative">
              <button
                type="button"
                (click)="menuOpen.set(!menuOpen())"
                class="grid h-9 w-9 place-items-center rounded-full bg-grow-600 text-xs font-extrabold text-white transition-transform hover:scale-105"
                [attr.aria-expanded]="menuOpen()"
                aria-haspopup="menu"
                [attr.aria-label]="auth.user()!.name"
              >
                {{ initials() }}
              </button>
              @if (menuOpen()) {
                <div
                  class="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-ink-200 bg-white p-1.5 shadow-xl"
                  role="menu"
                >
                  <div class="px-3 py-2">
                    <p class="truncate text-sm font-extrabold">{{ auth.user()!.name }}</p>
                    <p class="truncate text-xs text-ink-400">{{ roleLabel() | t }}</p>
                  </div>
                  <div class="my-1 h-px bg-ink-100"></div>
                  @for (item of nav(); track item.path) {
                    <a
                      [routerLink]="item.path"
                      (click)="menuOpen.set(false)"
                      class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-600 transition-colors hover:bg-ink-100 md:hidden"
                      role="menuitem"
                    >
                      {{ item.label | t }}
                    </a>
                  }
                  <button
                    type="button"
                    (click)="signOut()"
                    class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-ink-600 transition-colors hover:bg-ink-100"
                    role="menuitem"
                  >
                    <lucide-icon name="log-out" class="h-4 w-4" />
                    {{ 'nav.signOut' | t }}
                  </button>
                </div>
              }
            </div>
          } @else {
            <a
              routerLink="/login"
              class="rounded-full bg-grow-600 px-4 py-2 text-sm font-extrabold text-white transition-all hover:bg-grow-500 active:scale-[0.98]"
            >
              {{ 'nav.signIn' | t }}
            </a>
          }

          <ll-lang-toggle />
        </div>
      </div>
    </header>
  `,
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(LanguageService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);

  protected readonly nav = computed(() => {
    const items: NavItem[] = [{ path: '/', label: 'nav.catalog', exact: true }];
    if (this.auth.isInstructor()) items.push({ path: '/teach', label: 'nav.teach', exact: false });
    else if (this.auth.isStudent()) items.push({ path: '/learning', label: 'nav.myLearning', exact: false });
    items.push({ path: '/about', label: 'nav.about', exact: false });
    return items;
  });

  protected readonly roleLabel = computed(() =>
    this.auth.isInstructor() ? ('role.instructor' as const) : ('role.student' as const),
  );

  protected readonly initials = computed(() => {
    const name = this.auth.user()?.name ?? '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  });

  protected signOut(): void {
    this.menuOpen.set(false);
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
