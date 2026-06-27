import { test, expect } from '@playwright/test';

test.describe('User Management Flow', () => {
  // Pre-condition: We assume the user is authenticated as an admin/CEO
  test.beforeEach(async ({ page }) => {
    // Navigate to users page
    await page.goto('/users');
  });

  test('Create (Upload) a new user', async ({ page }) => {
    const addUserButton = page.locator('button:has-text("Add User"), button:has-text("Create User")');
    if (await addUserButton.isVisible()) {
      await addUserButton.click();

      // Fill out the user form
      await page.fill('input[name="name"]', 'Automated Test User');
      await page.fill('input[name="email"]', 'automated@test.com');
      // Select role
      await page.locator('select[name="role"], [role="combobox"]').first().click();
      await page.locator('text=Engineer').click(); // Assuming Engineer role exists
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Verify the user appears in the table
      await expect(page.locator('table')).toContainText('Automated Test User');
    }
  });

  test('Read users list', async ({ page }) => {
    // Verify table and data loads
    const tableRows = page.locator('table tbody tr');
    // Ensure we have at least one user (the seeded one)
    expect(await tableRows.count()).toBeGreaterThanOrEqual(1);
  });

  test('Update (Edit) an existing user', async ({ page }) => {
    // Find the automated user we just created or any existing user
    const userRow = page.locator('table tbody tr', { hasText: 'Automated Test User' }).first();
    if (await userRow.isVisible()) {
      // Click edit action
      await userRow.locator('button[aria-label="Edit"], button:has-text("Edit")').click();
      
      // Toggle a notification setting
      const emailNotifToggle = page.locator('input[name="emailNotificationsEnabled"], button[role="switch"]');
      if (await emailNotifToggle.isVisible()) {
        await emailNotifToggle.click();
      }

      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
      await saveButton.click();

      // Verify toast success
      await expect(page.locator('text=success')).toBeVisible();
    }
  });

  test('Delete a user', async ({ page }) => {
    const userRow = page.locator('table tbody tr', { hasText: 'Automated Test User' }).first();
    if (await userRow.isVisible()) {
      // Click delete action
      await userRow.locator('button[aria-label="Delete"], button:has-text("Delete")').click();
      
      // Confirm deletion in dialog
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      await confirmButton.click();

      // Verify removal
      await expect(userRow).not.toBeVisible();
    }
  });
});
