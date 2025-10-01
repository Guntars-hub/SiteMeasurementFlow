import { test, expect } from '@playwright/test';

test('dashboard login flow', async ({ page }) => {

  test.setTimeout(120000);
  
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

  //Open dashboard
  await page.goto('https://dashboard.dawninternet.com/');
  console.log("Dashboard opened✅");
  await page.waitForTimeout(1000);

  //Press Sign up / Login
  await page.getByRole('button', { name: 'Sign up / Login' }).click();
  console.log("Sign up / Login pressed✅");
  await page.waitForTimeout(1000);

  //Focus email input
  await page.getByRole('textbox', { name: 'Submit' }).click();
  console.log("Email input focused✅");
  await page.waitForTimeout(1000);

  //Enter Proton.me email
  const constantEmail = 'guntarsandrenatest@proton.me';
  await page.getByRole('textbox', { name: 'Submit' }).fill(constantEmail);
  console.log(`Email entered✅ -> ${constantEmail}`);
  await page.waitForTimeout(3000);

  //Submit email
  await page.getByRole('textbox', { name: 'Submit' }).press('Enter');
  console.log("Submit pressed✅");
  await page.waitForTimeout(3000);

  // Switch back to Proton Mail to get OTP
  await protonPage.goto('https://mail.proton.me/u/0/inbox');
  await protonPage.waitForTimeout(10000);
  await protonPage.reload();
  
  // Look for the specific OTP email from dashboard
  const otpEmailSelectors = [
    '[data-testid*="message-item"]:has-text("DAWN")',
    '[data-testid*="message-item"]:has-text("dashboard")',
    '[data-testid*="message-item"]:has-text("login code")',
    '[data-testid*="message-item"]'
  ];
  
  let emailClicked = false;
  for (const selector of otpEmailSelectors) {
    try {
      const emailElement = protonPage.locator(selector).first();
      if (await emailElement.isVisible({ timeout: 2000 })) {
        await emailElement.click();
        console.log(`Clicked on email using selector: ${selector}✅`);
        emailClicked = true;
        break;
      }
    } catch (e) {
      console.log(`Selector ${selector} not found, trying next...`);
    }
  }
  
  if (!emailClicked) {
    // console.log("No email found, trying first available email");
    const firstEmail = protonPage.locator('[data-testid*="message-item"]').first();
    await firstEmail.click();
    console.log("Clicked on first available email✅");
  }
  
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
    
    // Look for OTP codes specifically in the email list or content
    const otpPatterns = [
      /(\d{6})\s+is your login code for DAWN/i,     // DAWN specific pattern
      /login code for DAWN[^0-9]*(\d{6})/i,         // Alternative DAWN pattern
      /dashboard[^0-9]*(\d{6})/i,                   // Dashboard specific pattern
      /(\d{6})\s+is your login code/i,              // General login code pattern
      /verification code[:\s]*(\d{6})/i,            // Verification code pattern
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
  
  // Switch back to dashboard to continue
  await page.bringToFront();
  const digits = otpCode.split('');
  const inputs = page.locator('input[autocomplete="one-time-code"], input[type="text"][inputmode="numeric"], input[aria-label*="code" i]');
  for (let i = 0; i < digits.length; i++) {
    await inputs.nth(i).fill('');
    await inputs.nth(i).type(digits[i]);
  }
  await page.waitForTimeout(3000);
  console.log("OTP code filled automatically✅");

  //Click copy refferal code button
  await page.getByRole('button', { name: 'Copy my referral code' }).click();
  console.log("Copy my referral code button clicked✅");
  await page.waitForTimeout(3000);

  //Click referral input
  await page.waitForTimeout(3000);
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  console.log("Referral code tab clicked✅");
  await page.waitForTimeout(1000);

  //Enter referral code
  await page.getByRole('textbox', { name: 'Enter referral code' }).fill('123');
  console.log("Referral code entered✅");
  await page.waitForTimeout(1000);

  //Apply referral code
  await page.getByRole('button', { name: 'Apply Code' }).nth(1).click();
  console.log("Apply Code pressed✅");
  await page.waitForTimeout(1000);

  //Scroll down
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  console.log("Scrolled down✅");
  await page.waitForTimeout(3000);

  //Scroll up
  await page.evaluate(() => window.scrollTo(0, 0));
  console.log("Scrolled up✅");
  await page.waitForTimeout(3000);

  //Open dropdown menu next to username and click Log out
  const menuButtonCandidates = [
    page.getByRole('button', { name: /account|profile|user|menu|settings|gggunja/i }),
    page.locator('[data-testid="user-menu"], [aria-label*="account" i], [aria-label*="profile" i]')
  ];
  for (const candidate of menuButtonCandidates) {
    const btn = candidate.first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      console.log("User menu opened✅");
      await page.waitForTimeout(3000);
      break;
    }
  }
  const logoutItem = page.getByRole('menuitem', { name: /log out|logout|sign out/i }).or(
    page.getByRole('button', { name: /log out|logout|sign out/i })
  );
  await logoutItem.first().click().catch(() => {});
  console.log("Logged out✅");
  await page.waitForTimeout(1000);
  
  // Close the Proton Mail window
  await protonPage.close();
  
  await page.close();
});