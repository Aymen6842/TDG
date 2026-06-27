# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: users.spec.ts >> User Management Flow >> Read users list
- Location: e2e\users.spec.ts:30:7

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "404" [level=1] [ref=e4]
    - heading "This page could not be found." [level=2] [ref=e6]
  - button "Open Next.js Dev Tools" [ref=e12] [cursor=pointer]:
    - img [ref=e13]
  - alert [ref=e16]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('User Management Flow', () => {
  4  |   // Pre-condition: We assume the user is authenticated as an admin/CEO
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Navigate to users page
  7  |     await page.goto('/users');
  8  |   });
  9  | 
  10 |   test('Create (Upload) a new user', async ({ page }) => {
  11 |     const addUserButton = page.locator('button:has-text("Add User"), button:has-text("Create User")');
  12 |     if (await addUserButton.isVisible()) {
  13 |       await addUserButton.click();
  14 | 
  15 |       // Fill out the user form
  16 |       await page.fill('input[name="name"]', 'Automated Test User');
  17 |       await page.fill('input[name="email"]', 'automated@test.com');
  18 |       // Select role
  19 |       await page.locator('select[name="role"], [role="combobox"]').first().click();
  20 |       await page.locator('text=Engineer').click(); // Assuming Engineer role exists
  21 |       
  22 |       const submitButton = page.locator('button[type="submit"]');
  23 |       await submitButton.click();
  24 | 
  25 |       // Verify the user appears in the table
  26 |       await expect(page.locator('table')).toContainText('Automated Test User');
  27 |     }
  28 |   });
  29 | 
  30 |   test('Read users list', async ({ page }) => {
  31 |     // Verify table and data loads
  32 |     const tableRows = page.locator('table tbody tr');
  33 |     // Ensure we have at least one user (the seeded one)
> 34 |     expect(await tableRows.count()).toBeGreaterThanOrEqual(1);
     |                                     ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  35 |   });
  36 | 
  37 |   test('Update (Edit) an existing user', async ({ page }) => {
  38 |     // Find the automated user we just created or any existing user
  39 |     const userRow = page.locator('table tbody tr', { hasText: 'Automated Test User' }).first();
  40 |     if (await userRow.isVisible()) {
  41 |       // Click edit action
  42 |       await userRow.locator('button[aria-label="Edit"], button:has-text("Edit")').click();
  43 |       
  44 |       // Toggle a notification setting
  45 |       const emailNotifToggle = page.locator('input[name="emailNotificationsEnabled"], button[role="switch"]');
  46 |       if (await emailNotifToggle.isVisible()) {
  47 |         await emailNotifToggle.click();
  48 |       }
  49 | 
  50 |       const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
  51 |       await saveButton.click();
  52 | 
  53 |       // Verify toast success
  54 |       await expect(page.locator('text=success')).toBeVisible();
  55 |     }
  56 |   });
  57 | 
  58 |   test('Delete a user', async ({ page }) => {
  59 |     const userRow = page.locator('table tbody tr', { hasText: 'Automated Test User' }).first();
  60 |     if (await userRow.isVisible()) {
  61 |       // Click delete action
  62 |       await userRow.locator('button[aria-label="Delete"], button:has-text("Delete")').click();
  63 |       
  64 |       // Confirm deletion in dialog
  65 |       const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
  66 |       await confirmButton.click();
  67 | 
  68 |       // Verify removal
  69 |       await expect(userRow).not.toBeVisible();
  70 |     }
  71 |   });
  72 | });
  73 | 
```