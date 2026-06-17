// Single place to resolve the API base URL. In dev it points at the local
// Spring Boot server; the production build rewrites this at deploy time
// (window.__LEARNLOOP_API__ injected, or a sed of this constant — see Fase 10).
declare global {
  interface Window {
    __LEARNLOOP_API__?: string;
  }
}

const FALLBACK = 'http://localhost:8080/api';

export const API_BASE: string =
  (typeof window !== 'undefined' && window.__LEARNLOOP_API__) || FALLBACK;
