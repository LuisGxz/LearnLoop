import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header';
import { HelpLauncher } from './shared/ui/help-launcher';
import { TourOverlay } from './shared/ui/tour-overlay';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, HelpLauncher, TourOverlay],
  template: `
    <ll-header />
    <main class="min-h-[calc(100vh-4rem)]">
      <router-outlet />
    </main>
    <ll-help-launcher />
    <ll-tour-overlay />
  `,
})
export class App {}
