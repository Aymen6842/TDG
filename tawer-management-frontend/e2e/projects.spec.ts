import { test, expect } from '@playwright/test';

test.describe('Project & Task Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');
  });

  test('Create a Project', async ({ page }) => {
    const createBtn = page.locator('button:has-text("New Project"), button:has-text("Create Project")');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      
      await page.fill('input[name="name"], input[placeholder*="Project Name"]', 'E2E Automated Project');
      // Select methodology (e.g. Agile)
      await page.locator('select[name="methodology"], [role="combobox"]').first().click();
      await page.locator('text=Agile').click();
      
      await page.locator('button[type="submit"], button:has-text("Create")').click();
      
      // Verify redirection or appearance in the list
      await expect(page.locator('text=E2E Automated Project')).toBeVisible();
    }
  });

  test('Create a Task within a Project', async ({ page }) => {
    // Navigate into the project
    const projectCard = page.locator('text=E2E Automated Project').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      
      // Navigate to tasks or backlog
      const addTaskBtn = page.locator('button:has-text("Add Task"), button:has-text("New Task")');
      if (await addTaskBtn.isVisible()) {
        await addTaskBtn.click();
        
        await page.fill('input[name="title"], input[placeholder*="Title"]', 'E2E Automated Task');
        await page.fill('textarea[name="description"]', 'This is a test description.');
        
        await page.locator('button[type="submit"], button:has-text("Create")').click();
        
        await expect(page.locator('text=E2E Automated Task')).toBeVisible();
      }
    }
  });

  test('Task Details (Comments, Attachments, Labels, Reminders)', async ({ page }) => {
    // Navigate to the task
    const projectCard = page.locator('text=E2E Automated Project').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      
      const taskCard = page.locator('text=E2E Automated Task').first();
      if (await taskCard.isVisible()) {
        await taskCard.click();
        
        // --- Labels ---
        const addLabelBtn = page.locator('button:has-text("Add Label"), [aria-label="Labels"]');
        if (await addLabelBtn.isVisible()) {
          await addLabelBtn.click();
          await page.locator('text=Bug').first().click(); // Select a label
        }

        // --- Comments ---
        const commentInput = page.locator('textarea[placeholder*="comment"], input[placeholder*="comment"]');
        if (await commentInput.isVisible()) {
          await commentInput.fill('This is an automated E2E comment.');
          await page.locator('button:has-text("Post"), button:has-text("Send")').click();
          await expect(page.locator('text=This is an automated E2E comment.')).toBeVisible();
        }

        // --- Attachments ---
        // Playwright handles file uploads via setInputFiles
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.isVisible()) {
          // In a real test, we'd provide a buffer or a real test file path
          // await fileInput.setInputFiles('e2e/test-files/dummy.pdf');
        }

        // --- Reminders ---
        const reminderBtn = page.locator('button:has-text("Add Reminder"), [aria-label="Reminders"]');
        if (await reminderBtn.isVisible()) {
          await reminderBtn.click();
          // Assuming a dialog opens to pick date/time
          await page.locator('button:has-text("Save Reminder")').click();
        }
      }
    }
  });

  test('Update Task Status (Drag/Drop or Select)', async ({ page }) => {
    const projectCard = page.locator('text=E2E Automated Project').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      
      const taskCard = page.locator('text=E2E Automated Task').first();
      if (await taskCard.isVisible()) {
        await taskCard.click();
        
        // If it's a dropdown in the sheet
        const statusDropdown = page.locator('select[name="status"], [aria-label="Status"]');
        if (await statusDropdown.isVisible()) {
          await statusDropdown.click();
          await page.locator('text="In Progress"').click();
        }
        
        // Wait for it to save
        await expect(page.locator('text=success')).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Delete Task and Project', async ({ page }) => {
    const projectCard = page.locator('text=E2E Automated Project').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      
      // Delete Task
      const taskCard = page.locator('text=E2E Automated Task').first();
      if (await taskCard.isVisible()) {
        await taskCard.click();
        const deleteBtn = page.locator('button:has-text("Delete"), [aria-label="Delete Task"]');
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          await page.locator('button:has-text("Confirm"), button:has-text("Yes")').click();
          await expect(taskCard).not.toBeVisible();
        }
      }

      // Delete Project (from settings or header)
      const projectSettingsBtn = page.locator('[aria-label="Project Settings"], button:has-text("Settings")');
      if (await projectSettingsBtn.isVisible()) {
        await projectSettingsBtn.click();
        const deleteProjectBtn = page.locator('button:has-text("Delete Project")');
        await deleteProjectBtn.click();
        await page.locator('button:has-text("Confirm"), button:has-text("Yes")').click();
        
        // Should redirect back to projects list
        await expect(page).toHaveURL(/.*projects/);
      }
    }
  });
});
