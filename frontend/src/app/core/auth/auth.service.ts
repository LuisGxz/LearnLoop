import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { TokenStore } from './token-store';
import { AuthResponse, Role, User } from '../models';

interface Credentials {
  email: string;
  password: string;
}
interface Registration extends Credentials {
  name: string;
  role: Role;
}

/**
 * Owns the signed-in user as a signal. Hydrates from a stored token on boot,
 * keeps the cached user fresh after gamification events, and exposes role
 * helpers the header/guards read.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly tokens = inject(TokenStore);

  private readonly _user = signal<User | null>(null);
  private readonly _ready = signal(false);

  readonly user = this._user.asReadonly();
  readonly ready = this._ready.asReadonly(); // initial hydration finished
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isInstructor = computed(() => this._user()?.role === 'INSTRUCTOR');
  readonly isStudent = computed(() => this._user()?.role === 'STUDENT');

  /** Called once at startup to restore the session from a stored token. */
  async hydrate(): Promise<void> {
    if (this.tokens.get()) {
      try {
        this._user.set(await this.api.get<User>('/auth/me'));
      } catch {
        this.tokens.clear(); // stale/expired token → signed out
      }
    }
    this._ready.set(true);
  }

  async login(creds: Credentials): Promise<User> {
    return this.adopt(await this.api.post<AuthResponse>('/auth/login', creds));
  }

  async register(reg: Registration): Promise<User> {
    return this.adopt(await this.api.post<AuthResponse>('/auth/register', reg));
  }

  logout(): void {
    this.tokens.clear();
    this._user.set(null);
  }

  /** Merge fresh gamification numbers (xp/streak) into the cached user. */
  patch(partial: Partial<Pick<User, 'xp' | 'streakDays' | 'title'>>): void {
    const current = this._user();
    if (current) this._user.set({ ...current, ...partial });
  }

  private adopt(res: AuthResponse): User {
    this.tokens.set(res.token);
    this._user.set(res.user);
    return res.user;
  }
}
