import { Routes } from '@angular/router';

/**
 * Lazy, standalone routes. Screen components land per phase (catalog F5,
 * lesson F6, quiz F7, role panels/login F8, about F9); placeholders keep the
 * nav resolvable until then.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/catalog').then((m) => m.Catalog),
  },
  {
    path: 'course/:id',
    loadComponent: () => import('./pages/course').then((m) => m.Course),
  },
  {
    path: 'quiz/:id',
    loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
    data: { title: 'Quiz' },
  },
  {
    path: 'certificate/:id',
    loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
    data: { title: 'Certificate' },
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
    data: { title: 'Sign in' },
  },
  {
    path: 'learning',
    loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
    data: { title: 'My learning' },
  },
  {
    path: 'teach',
    loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
    data: { title: 'Teach' },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
    data: { title: 'About' },
  },
  { path: '**', redirectTo: '' },
];
