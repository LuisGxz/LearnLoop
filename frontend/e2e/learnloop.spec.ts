import { test, expect, Page } from '@playwright/test';

// Every test fails on any console.error / pageerror — a hard quality gate.
function guardConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

async function signInDemo(page: Page, who: 'Student' | 'Instructor') {
  await page.goto('/login');
  await page.getByRole('button', { name: `${who} demo` }).click();
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/(learning|teach)/);
}

test.beforeEach(async ({ context }) => {
  // Fresh storage so the tour auto-start is deterministic per test.
  await context.clearCookies();
});

test('guest browses the catalog and opens a course', async ({ page }) => {
  const errors = guardConsole(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Explore courses/i })).toBeVisible();
  await page.locator('[data-tour="catalog"] a').first().click();
  await expect(page).toHaveURL(/\/course\/\d+/);
  await expect(page.getByText(/Module 1/i).first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('guided tour auto-starts and can be dismissed', async ({ page }) => {
  const errors = guardConsole(page);
  await page.goto('/');
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await expect(dialog.getByText(/Welcome to LearnLoop/i)).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(dialog).toBeHidden();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('student sees their learning dashboard', async ({ page }) => {
  const errors = guardConsole(page);
  await signInDemo(page, 'Student');
  await expect(page.getByRole('heading', { name: /My learning/i })).toBeVisible();
  await expect(page.getByText(/In progress|Completed/i).first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('student takes a quiz and sees a graded result', async ({ page }) => {
  const errors = guardConsole(page);
  await signInDemo(page, 'Student');
  await page.goto('/quiz/1?course=1');
  // Answer every question (pick the first option each), advancing to results.
  for (let i = 0; i < 3; i++) {
    await page.locator('div.space-y-3 > button').first().click();
    await page.getByRole('button', { name: /Next question|See results/ }).click();
  }
  await expect(page.getByText(/Quiz complete!|Not quite/)).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/correct/)).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('instructor creates and deletes a course', async ({ page }) => {
  const errors = guardConsole(page);
  await signInDemo(page, 'Instructor');
  await page.goto('/teach/new');

  const title = `E2E Course ${Date.now()}`;
  await page.locator('input[formcontrolname="title"]').first().fill(title);
  await page
    .locator('textarea[formcontrolname="description"]')
    .fill('A course created by the end-to-end test suite to validate the builder.');
  await page.locator('input[formcontrolname="category"]').fill('Code');
  await page.getByPlaceholder('Module title').fill('Module one');
  await page.getByPlaceholder('Lesson title').first().fill('First lesson');
  await page.getByRole('button', { name: /Save course/ }).click();

  await expect(page).toHaveURL(/\/course\/\d+/);
  await expect(page.getByText(title)).toBeVisible();

  // Clean up: delete it from the teach panel.
  await page.goto('/teach');
  const card = page.locator('.rounded-3xl', { hasText: title });
  page.once('dialog', (d) => d.accept());
  await card.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(title)).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});
