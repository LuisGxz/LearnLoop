import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. Expects the Spring Boot API on :8080 (with seeded demo data) and
 * starts the Angular dev server on :4200 automatically. Run:
 *   cd backend && ./mvnw spring-boot:run     # terminal 1
 *   cd frontend && npm run e2e               # terminal 2
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    locale: 'en-US',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
