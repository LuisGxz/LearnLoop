import { Injectable } from '@angular/core';

const KEY = 'learnloop.token';

/** Persists the JWT in localStorage; the interceptor and AuthService read it. */
@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly available =
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  get(): string | null {
    return this.available ? window.localStorage.getItem(KEY) : null;
  }

  set(token: string): void {
    if (this.available) window.localStorage.setItem(KEY, token);
  }

  clear(): void {
    if (this.available) window.localStorage.removeItem(KEY);
  }
}
