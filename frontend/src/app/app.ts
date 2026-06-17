import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header],
  template: `
    <ll-header />
    <main class="min-h-[calc(100vh-4rem)]">
      <router-outlet />
    </main>
  `,
})
export class App {}
