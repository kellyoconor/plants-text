const { test, expect } = require('@playwright/test');

test.describe('User Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display onboarding form', async ({ page }) => {
    // Check if welcome step is visible first - this is the actual first screen
    await expect(page.locator('h1').filter({ hasText: 'PlantTexts' })).toBeVisible();
    await expect(page.locator('text=Chat with your plants. Keep them happy.')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Start Growing' })).toBeVisible();
    
    // Check that the welcome step shows the process explanation
    await expect(page.locator('text=Share your number')).toBeVisible();
    await expect(page.locator('text=Add your plants')).toBeVisible();
    await expect(page.locator('text=Start chatting')).toBeVisible();
  });

  test('should navigate from welcome to phone step', async ({ page }) => {
    // Start on welcome step
    await expect(page.locator('h1').filter({ hasText: 'PlantTexts' })).toBeVisible();
    
    // Click Start Growing button
    await page.locator('button').filter({ hasText: 'Start Growing' }).click();
    
    // Should now be on phone step
    await expect(page.locator('h2').filter({ hasText: "What's your number?" })).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Continue' })).toBeVisible();
  });

  test('should validate phone number input', async ({ page }) => {
    // Navigate to phone step
    await page.locator('button').filter({ hasText: 'Start Growing' }).click();
    
    const phoneInput = page.locator('input[type="tel"]');
    const submitButton = page.locator('button').filter({ hasText: 'Continue' });

    // Test empty phone number - button should be disabled
    await phoneInput.fill('');
    await expect(submitButton).toBeDisabled();

    // Test valid phone number - button should be enabled
    await phoneInput.fill('+1234567890');
    await expect(submitButton).toBeEnabled();
  });

  // Email input test removed - no email field in actual form

  test('should create user successfully', async ({ page }) => {
    // Navigate to phone step
    await page.locator('button').filter({ hasText: 'Start Growing' }).click();
    
    // Fill out the form
    await page.locator('input[type="tel"]').fill('+1234567890');
    
    // Submit the form
    await page.locator('button').filter({ hasText: 'Continue' }).click();
    
    // Wait for API call to complete
    await page.waitForResponse(response => 
      response.url().includes('/users') && response.status() === 200
    );
    
    // Should navigate to plant selection step
    await expect(page.locator('h2').filter({ hasText: 'What plants do you have?' })).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Navigate to phone step
    await page.locator('button').filter({ hasText: 'Start Growing' }).click();
    
    // Mock API error
    await page.route('**/users/find-or-create', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    // Fill out the form
    await page.locator('input[type="tel"]').fill('+1234567890');
    
    // Submit the form
    await page.locator('button').filter({ hasText: 'Continue' }).click();
    
    // Should show error message (alert or console error)
    await expect(page.locator('text=Failed to set up account')).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    // Navigate to phone step
    await page.locator('button').filter({ hasText: 'Start Growing' }).click();
    
    // Fill out the form
    await page.locator('input[type="tel"]').fill('+1234567890');
    
    // Submit the form
    await page.locator('button').filter({ hasText: 'Continue' }).click();
    
    // Should show loading state (spinner or disabled button)
    await expect(page.locator('text=Creating your garden...')).toBeVisible();
  });
});

