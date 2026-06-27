import { test, expect } from '@playwright/test';

test.describe('Settings & Notifications Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard or base authenticated route
    await page.goto('/dashboard');
  });

  test('Toggle Notification Settings', async ({ page }) => {
    // Open user menu
    const userMenu = page.locator('[aria-label="User menu"], .user-avatar');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Click on settings
      await page.locator('text=Settings, text="My Profile"').click();
      
      // Ensure we are on the settings page
      await expect(page).toHaveURL(/.*settings/);
      
      // Toggle Email Notifications
      const emailToggle = page.locator('button[role="switch"][name="emailNotificationsEnabled"], input[name="emailNotificationsEnabled"]');
      if (await emailToggle.isVisible()) {
        const initialState = await emailToggle.getAttribute('aria-checked');
        await emailToggle.click();
        await page.locator('button:has-text("Save Changes")').click();
        
        // Wait for success toast
        await expect(page.locator('text=success')).toBeVisible();
        
        // Reload to verify persistence
        await page.reload();
        const newState = await emailToggle.getAttribute('aria-checked');
        expect(newState).not.toBe(initialState);
      }
    }
  });

  test('Interact with Notifications Bell', async ({ page }) => {
    const notifBell = page.locator('[aria-label="Notifications"], .notification-bell');
    if (await notifBell.isVisible()) {
      // Click the bell
      await notifBell.click();
      
      // Expect a popover or dropdown
      const notifContainer = page.locator('.notifications-dropdown, [role="menu"]');
      await expect(notifContainer).toBeVisible();
      
      // Mark as read
      const markReadBtn = page.locator('button:has-text("Mark all as read")');
      if (await markReadBtn.isVisible()) {
        await markReadBtn.click();
        // Unread badge should disappear
        await expect(page.locator('.unread-badge')).not.toBeVisible();
      }
    }
  });
});
