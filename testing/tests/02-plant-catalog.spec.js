const { test, expect } = require('@playwright/test');

test.describe('Plant Catalog', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user session
    await page.addInitScript(() => {
      localStorage.setItem('plantTextsUserId', '1');
    });
    await page.goto('/addPlants');
  });

  test('should load plant catalog', async ({ page }) => {
    // Wait for catalog to load
    await page.waitForResponse(response => 
      response.url().includes('/catalog') && response.status() === 200
    );
    
    // Check if plant grid is displayed
    await expect(page.locator('.grid')).toBeVisible();
    
    // Check if multiple plants are loaded
    const plantCards = page.locator('.grid > div');
    await expect(plantCards).toHaveCount.greaterThan(0);
  });

  test('should display plant information correctly', async ({ page }) => {
    await page.waitForResponse(response => 
      response.url().includes('/catalog') && response.status() === 200
    );
    
    const firstPlant = page.locator('.grid > div').first();
    
    // Check if plant name is displayed
    await expect(firstPlant.locator('h3')).toBeVisible();
    
    // Check if plant image is displayed
    await expect(firstPlant.locator('img')).toBeVisible();
    
    // Check if care requirements are displayed
    await expect(firstPlant.locator('text=Every')).toBeVisible();
    
    // Check if add button is displayed
    await expect(firstPlant.locator('button').filter({ hasText: 'Add Plant' })).toBeVisible();
  });

  test('should search plants', async ({ page }) => {
    await page.waitForResponse(response => 
      response.url().includes('/catalog') && response.status() === 200
    );
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search plants"]');
    await expect(searchInput).toBeVisible();
    
    // Perform search
    await searchInput.fill('snake');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Check if results are filtered
    const plantCards = page.locator('.grid > div');
    const count = await plantCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open plant details', async ({ page }) => {
    await page.waitForResponse(response => 
      response.url().includes('/catalog') && response.status() === 200
    );
    
    // Click on first plant's add button
    const firstPlant = page.locator('.grid > div').first();
    await firstPlant.locator('button').filter({ hasText: 'Add Plant' }).click();
    
    // Check if add plant form is opened
    await expect(page.locator('text=What do you call this plant?')).toBeVisible();
  });

  test('should suggest personality for plant', async ({ page }) => {
    await page.waitForResponse(response => 
      response.url().includes('/catalog') && response.status() === 200
    );
    
    // Click on first plant
    const firstPlant = page.locator('.plant-card, .catalog-item').first();
    await firstPlant.click();
    
    // Wait for plant details to load
    await page.waitForResponse(response => 
      response.url().includes('/suggest-personality') && response.status() === 200
    );
    
    // Check if personality suggestion is displayed
    await expect(page.locator('.personality-suggestion, .personality-info')).toBeVisible();
  });

  test('should add plant to user collection', async ({ page }) => {
    await page.waitForResponse(response => 
      response.url().includes('/catalog') && response.status() === 200
    );
    
    // Click on first plant
    const firstPlant = page.locator('.plant-card, .catalog-item').first();
    await firstPlant.click();
    
    // Wait for plant details to load
    await page.waitForTimeout(1000);
    
    // Click add plant button
    const addButton = page.locator('button:has-text("Add Plant"), .add-plant-btn');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Wait for API call
    await page.waitForResponse(response => 
      response.url().includes('/plants') && response.status() === 200
    );
    
    // Should show success message or navigate to dashboard
    await expect(page.locator('.success-message, .toast')).toBeVisible();
  });

  test('should handle API errors', async ({ page }) => {
    // Mock API error
    await page.route('**/catalog', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/addPlants');
    
    // Should show error message
    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Mock slow API response
    await page.route('**/catalog', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    await page.goto('/addPlants');
    
    // Should show loading spinner
    await expect(page.locator('.loading, .spinner, [data-testid="loading"]')).toBeVisible();
  });
});

