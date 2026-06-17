import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  LucideAngularModule,
  Infinity,
  Flame,
  Gem,
  LogOut,
  LogIn,
  LoaderCircle,
  Inbox,
  TriangleAlert,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  CirclePlus,
  ChevronDown,
  User,
  Globe,
  ArrowLeft,
  Play,
  Check,
  Flag,
  Trophy,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-angular';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt.interceptor';
import { AuthService } from './core/auth/auth.service';

const ICONS = {
  Infinity, Flame, Gem, LogOut, LogIn, LoaderCircle, Inbox, TriangleAlert, Award,
  BookOpen, GraduationCap, Sparkles, CirclePlus, ChevronDown, User, Globe,
  ArrowLeft, Play, Check, Flag, Trophy, Clock, Pencil, Trash2,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom(LucideAngularModule.pick(ICONS)),
    // Restore the session from a stored JWT before the first screen renders.
    provideAppInitializer(() => inject(AuthService).hydrate()),
  ],
};
