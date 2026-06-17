import { Injectable, computed, signal } from '@angular/core';
import { COPY, CopyKey, Lang } from './copy';

const KEY = 'learnloop.lang';

/**
 * App-wide language state (EN/ES) on signals. Persists the choice and seeds
 * from a prior choice or the browser locale, defaulting to English.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _lang = signal<Lang>(this.initial());
  readonly lang = this._lang.asReadonly();
  readonly isSpanish = computed(() => this._lang() === 'es');

  set(lang: Lang): void {
    this._lang.set(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(KEY, lang);
      document.documentElement.lang = lang;
    }
  }

  toggle(): void {
    this.set(this._lang() === 'en' ? 'es' : 'en');
  }

  /** Translate a known key for the current language. */
  t(key: CopyKey): string {
    return COPY[key][this._lang()];
  }

  private initial(): Lang {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'es') return saved;
    return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
  }
}
