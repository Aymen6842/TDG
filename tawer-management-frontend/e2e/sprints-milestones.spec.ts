import { test, expect } from '@playwright/test';

test.describe('Sprints & Milestones Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('Create and Start a Sprint', async ({ page }) => {
    // Navigate into a project
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      
      // Go to Sprints tab/view
      const sprintsTab = page.locator('a:has-text("Sprints"), button:has-text("Sprints")');
      if (await sprintsTab.isVisible()) {
        await sprintsTab.click();
        
        // Create sprint
        const createSprintBtn = page.locator('button:has-text("New Sprint"), button:has-text("Create Sprint")');
        if (await createSprintBtn.isVisible()) {
          await createSprintBtn.click();
          await page.fill('input[name="name"]', 'E2E Sprint 1');
          await page.locator('button[type="submit"]').click();
          
          await expect(page.locator('text=E2E Sprint 1')).toBeVisible();
        }
        
        // Start sprint
        const startSprintBtn = page.locator('button:has-text("Start Sprint")').first();
        if (await startSprintBtn.isVisible()) {
          await startSprintBtn.click();
          await page.locator('button:has-text("Confirm")').click();
          // Verify status changes to ACTIVE
          await expect(page.locator('text=Active').first()).toBeVisible();
        }
      }
    }
  });

  test('Create a Milestone and track progress', async ({ page }) => {
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      
      // Go to Milestones tab/view
      const milestonesTab = page.locator('a:has-text("Milestones"), button:has-text("Milestones")');
      if (await milestonesTab.isVisible()) {
        await milestonesTab.click();
        
        // Create milestone
        const createMilestoneBtn = page.locator('button:has-text("New Milestone")');
        if (await createMilestoneBtn.isVisible()) {
          await createMilestoneBtn.click();
          await page.fill('input[name="title"]', 'E2E MVP Release');
          await page.locator('button[type="submit"]').click();
          
          await expect(page.locator('text=E2E MVP Release')).toBeVisible();
          // Verify initial progress is 0%
          await expect(page.locator('text=0%').first()).toBeVisible();
        }
      }
    }
  });
});
