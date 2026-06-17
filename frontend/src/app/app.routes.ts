import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/guards';

/** Lazy, standalone routes with auth/role guards on the gated areas. */
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
    canActivate: [authGuard],
    loadComponent: () => import('./pages/quiz').then((m) => m.Quiz),
  },
  {
    path: 'certificate/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/certificate').then((m) => m.Certificate),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login').then((m) => m.Login),
  },
  {
    path: 'learning',
    canActivate: [roleGuard('STUDENT')],
    loadComponent: () => import('./pages/learning').then((m) => m.Learning),
  },
  {
    path: 'teach',
    canActivate: [roleGuard('INSTRUCTOR')],
    loadComponent: () => import('./pages/teach').then((m) => m.Teach),
  },
  {
    path: 'teach/new',
    canActivate: [roleGuard('INSTRUCTOR')],
    loadComponent: () => import('./pages/course-builder').then((m) => m.CourseBuilder),
  },
  {
    path: 'teach/:id/edit',
    canActivate: [roleGuard('INSTRUCTOR')],
    loadComponent: () => import('./pages/course-builder').then((m) => m.CourseBuilder),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/placeholder').then((m) => m.Placeholder),
    data: { title: 'About' },
  },
  { path: '**', redirectTo: '' },
];
