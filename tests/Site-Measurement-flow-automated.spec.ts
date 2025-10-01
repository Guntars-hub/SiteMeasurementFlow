import { test, expect } from '@playwright/test';
test.setTimeout(120000);
test('Site-measurement flow-automated', async ({ page }) => {

  // Create new window for Proton Mail
  const protonPage = await page.context().newPage();
  
  // Open Proton Mail in the new window
  await protonPage.goto('https://proton.me/');
  await protonPage.getByRole('link', { name: 'Sign in' }).click();
  await protonPage.getByRole('textbox', { name: 'Email or username' }).fill('guntarsandrenatest@proton.me');
  await protonPage.getByRole('textbox', { name: 'Email or username' }).press('Tab');
  await protonPage.getByRole('textbox', { name: 'Password' }).fill('Google123$');
  await protonPage.getByRole('button', { name: 'Sign in' }).click();
  await protonPage.getByTestId('explore-mail').click();
  console.log("Proton Mail opened in new window✅");
  
  // Use original page for dev.explorer
  await page.goto('https://dev.explorer.dawninternet.net/connect?redirect=/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Submit' }).click();
  await page.getByRole('textbox', { name: 'Submit' }).fill('guntarsandrenatest@proton.me');
  await page.getByRole('textbox', { name: 'Submit' }).press('Enter');
  console.log("Dev.explorer opened in original window✅");
  
  // Switch back to Proton Mail to get OTP
  await protonPage.goto('https://mail.proton.me/u/0/inbox');
  await protonPage.waitForTimeout(7000);
  await protonPage.reload();
  
  // Find and click the newest email (first email in the list)
  const newestEmail = protonPage.locator('[data-testid*="message-item"]').first();
  await newestEmail.click();
  console.log("Clicked on newest email✅");
  
  // Wait for email content to load
  await protonPage.waitForTimeout(3000);
  
  // Try multiple selectors to find the OTP
  const otpSelectors = [
    '[data-id="react-email-text"]',
    'p[data-id="react-email-text"]',
    'p[style*="font-size: 32px"]',
    'p[style*="font-weight: 500"]'
  ];
  
  let emailContent = '';
  let otpCode = '';
  
  for (const selector of otpSelectors) {
    try {
      const element = protonPage.locator(selector);
      if (await element.isVisible({ timeout: 2000 })) {
        emailContent = await element.textContent() || '';
        console.log(`Found content with selector ${selector}:`, emailContent);
        
        // Look for 6-digit OTP code
        const otpMatch = emailContent.match(/(\d{6})/);
        if (otpMatch) {
          otpCode = otpMatch[1];
          console.log(`✅ Found OTP with selector ${selector}: ${otpCode}`);
          break;
        }
      }
    } catch (e) {
      console.log(`Selector ${selector} failed:`, e.message);
    }
  }
  
  // If still no OTP found, try getting all text content from the email
  if (!otpCode) {
    console.log("Trying to get all email content...");
    const allContent = await protonPage.locator('body').textContent() || '';
    // console.log("All page content:", allContent);
    
    // Look for OTP codes specifically in the email list or content
    const otpPatterns = [
      /(\d{6})\s+is your login code for DAWN DEV/,  // Most specific pattern
      /login code for DAWN DEV[^0-9]*(\d{6})/,      // Alternative pattern
      /(\d{6})\s+is your login code/,               // General login code pattern
      /(\d{6})/                                     // Fallback to any 6 digits
    ];
    
    for (const pattern of otpPatterns) {
      const match = allContent.match(pattern);
      if (match) {
        otpCode = match[1];
        console.log(`✅ Found OTP with pattern ${pattern}: ${otpCode}`);
        break;
      }
    }
  }
  
  if (!otpCode) {
    throw new Error('Could not find 6-digit OTP code in email');
  }
  
  console.log(`Retrieved OTP code: ${otpCode}✅`);
  
  // Switch back to dev.explorer to continue
  await page.bringToFront();
  await page.locator('input[name="code-0"]').fill(otpCode);
  console.log("OTP code filled✅");
  await page.getByRole('button', { name: 'Continue' }).click();
  console.log("Continue button pressed✅");
  await page.getByRole('link', { name: 'Site Measurement' }).click();
  console.log("Site Measurement link clicked✅");
  await page.getByRole('button', { name: 'Search location' }).click();
  console.log("Search location button clicked✅");
  await page.getByRole('textbox', { name: 'Try adresses' }).click();
  await page.getByRole('textbox', { name: 'Try adresses' }).fill('Riga');
  console.log("Riga entered in address field✅");
  await page.getByRole('button', { name: 'Search location' }).click();
  console.log("Search button pressed✅");
  await page.locator('div').filter({ hasText: /^Riga, LatviaGo$/ }).getByRole('button').click();
  console.log("Go button clicked for Riga✅");
  await page.getByRole('button', { name: 'Confirm' }).click();
  console.log("Confirm button pressed - measurement started✅");
  console.log("Waiting for 10 seconds before closing the browser✅");
  await page.waitForTimeout(10000);
  await page.close();
  // Close the Proton Mail window
  await protonPage.close();
});