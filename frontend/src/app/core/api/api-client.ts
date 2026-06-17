import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { API_BASE } from '../config';
import { ApiError } from './api-error';

/**
 * Thin promise-based wrapper over HttpClient. Every call funnels failures
 * through ApiError.from so callers get a uniform `{ status, message, fields }`
 * shape and never have to touch HttpErrorResponse.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.run(this.http.get<T>(this.url(path), { params: this.toParams(params) }));
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.run(this.http.post<T>(this.url(path), body ?? {}));
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.run(this.http.put<T>(this.url(path), body ?? {}));
  }

  delete<T>(path: string): Promise<T> {
    return this.run(this.http.delete<T>(this.url(path)));
  }

  private async run<T>(obs: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(obs);
    } catch (err) {
      throw ApiError.from(err);
    }
  }

  private url(path: string): string {
    return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private toParams(params?: Record<string, string | number | boolean>): Record<string, string> {
    const out: Record<string, string> = {};
    if (params) for (const [k, v] of Object.entries(params)) out[k] = String(v);
    return out;
  }
}
