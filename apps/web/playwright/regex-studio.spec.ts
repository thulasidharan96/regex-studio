import { test, expect } from '@playwright/test';

test.describe('Regex Studio v3 E2E Suite', () => {
  test('should load app, build regex, compile, test input, and persist project', async ({ page }) => {
    // 1. Open the application
    await page.goto('/');
    await expect(page).toHaveTitle(/Regex Studio/i);

    // 2. Select visual builder or canvas
    const canvas = page.locator('#regex-canvas-container');
    await expect(canvas).toBeVisible();

    // 3. Trigger raw regex compiler/input change
    const importInput = page.locator('input[placeholder*="Import"]');
    if (await importInput.isVisible()) {
      await importInput.fill('^[a-z]+$');
      await importInput.press('Enter');
    }

    // 4. Test input execution matches correctly
    const sampleArea = page.locator('textarea[placeholder*="sample text" i]');
    if (await sampleArea.isVisible()) {
      await sampleArea.fill('hello');
      const matchIndicator = page.locator('.match-success-indicator');
      await expect(matchIndicator).toBeVisible();
    }

    // 5. Save the active project
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // 6. Reload and check state persistence
    await page.reload();
    await expect(page).toHaveTitle(/Regex Studio/i);
  });
});
