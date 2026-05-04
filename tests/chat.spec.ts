import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test('should load the chat area and send a message', async ({ page }) => {
    await page.goto('/');

    // Check for title or logo
    await expect(page.locator('h1')).toContainText('AgenticLM');

    // Find input and send a message
    const input = page.locator('#chat-input');
    await input.fill('Hello, are you functional?');
    await page.click('#send-btn');

    // Wait for the message to appear in the list
    await expect(page.locator('.whitespace-pre-wrap').last()).toBeVisible();
  });

  test('should trigger reasoning agent for complex queries', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#chat-input');
    await input.fill('Search for recent news on AI agents using Tavily.');
    await page.click('#send-btn');

    // Check for tool calling animation/text or reasoning process
    // Increased timeout to 15s as reasoning agents take time to respond
    await expect(page.getByText(/THOUGHT PROCESS|Searching the web|Consulting Reasoning Agent/))
      .toBeVisible({ timeout: 15000 });
  });
});
