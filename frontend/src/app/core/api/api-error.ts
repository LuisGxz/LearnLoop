import { HttpErrorResponse } from '@angular/common/http';

/**
 * Normalized API error. The backend speaks RFC-7807 ProblemDetail with an
 * extra `fields` map (see GlobalExceptionHandler), so we surface both a human
 * message and a per-field map the forms can render next to each input.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** True for network / server outages where retrying is the right hint. */
  get isInfra(): boolean {
    return this.status === 0 || this.status >= 500;
  }

  fieldError(name: string): string | undefined {
    return this.fields[name];
  }

  static from(err: unknown): ApiError {
    if (err instanceof ApiError) return err;

    if (err instanceof HttpErrorResponse) {
      // status 0 → no response (offline / CORS / server down)
      if (err.status === 0) {
        return new ApiError(0, "Can't reach the server. Check your connection and try again.");
      }
      const body = err.error ?? {};
      const message =
        body.detail || body.message || err.message || 'Something went wrong. Please try again.';
      const fields = (body.fields as Record<string, string>) ?? {};
      return new ApiError(err.status, message, fields);
    }

    return new ApiError(500, 'Something went wrong. Please try again.');
  }
}
