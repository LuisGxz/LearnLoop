import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { TokenStore } from './token-store';
import { API_BASE } from '../config';

/**
 * Attaches the bearer token to our own API calls and, on a 401, clears the
 * stale token so the app falls back to the signed-out state cleanly.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(TokenStore);
  const token = store.get();

  const isApi = req.url.startsWith(API_BASE);
  const authed =
    token && isApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isApi) store.clear();
      return throwError(() => err);
    }),
  );
};
