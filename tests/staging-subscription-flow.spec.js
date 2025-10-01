//@ts-check

import { test, expect } from '@playwright/test';

// Complete subscription flow test for staging site
test('Complete subscription flow with payment and cancellation', async ({ page }) => {

    //Set test timeout 120 seconds for longer flow
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

    //Open staging webpage
    await page.goto('https://staging.beta.dawninternet.net/');
    console.log("Staging site opened✅");

    //Press Sign Up button first
    await page.getByRole('button',{name: 'Sign Up'}).click();
    console.log("Sign up button pressed✅");

    //Wait for packages container to load
    await page.waitForSelector('div.flex.flex-col.gap-4.overflow-y-scroll', { timeout: 10000 });
    console.log("Packages container loaded✅");

    //Scroll down within the packages section to make the 4th package visible
    const packagesContainer = await page.locator('div.flex.flex-col.gap-4.overflow-y-scroll.max-h-\\[450px\\]');
    await packagesContainer.evaluate((element) => {
            element.scrollTop = element.scrollHeight;
        });
    console.log("Scrolled packages container✅");

    await page.waitForTimeout(2000);
    console.log("Scroll attempts completed✅");

    //Select the 4th package that costs 60 Cedi using multiple approaches
    await page.locator('button:has(span:text("4"))').click();
    console.log("4th package selected by button containing span '4'✅");

    //Press Next after selecting the package
    await page.getByText('Next').click();
    console.log("Next button pressed after package selection✅");

    // Use the same Proton.me email for OTP
    const constantEmail = 'guntarsandrenatest@proton.me';
    await page.getByPlaceholder('your@email.com').fill(constantEmail);
    console.log(`Email entered✅ -> ${constantEmail}`);

    //Submit entered email
    await page.getByRole('button', { name: 'Submit' }).click();
    console.log("Submit pressed✅");

    // Switch back to Proton Mail to get OTP
    await protonPage.goto('https://mail.proton.me/u/0/inbox');
    await protonPage.waitForTimeout(7000);
    await protonPage.reload();
    
    // Look for the specific OTP email from staging site
    const otpEmailSelectors = [
        '[data-testid*="message-item"]:has-text("DAWN")',
        '[data-testid*="message-item"]:has-text("staging")',
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
        console.log("No email found, trying first available email");
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
        // console.log("All page content:", allContent);
        
        // Look for OTP codes specifically in the email list or content
        const otpPatterns = [
            /(\d{6})\s+is your login code for DAWN/i,     // DAWN specific pattern
            /login code for DAWN[^0-9]*(\d{6})/i,         // Alternative DAWN pattern
            /staging[^0-9]*(\d{6})/i,                     // Staging specific pattern
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
    
    // Switch back to staging site to continue
    await page.bringToFront();
    const digits = otpCode.split('');
    const inputs = page.locator('input[autocomplete="one-time-code"], input[type="text"][inputmode="numeric"], input[aria-label*="code" i]');
    for (let i = 0; i < digits.length; i++) {
        await inputs.nth(i).fill('');
        await inputs.nth(i).type(digits[i]);
    }
    await page.waitForTimeout(3000);
    console.log("OTP code filled automatically✅");


    //Press Stripe payment option
    await page.getByText('Stripe').click();
    console.log("Stripe payment option selected✅");

    //Enter email for payment
    await page.getByPlaceholder('email').fill('example@example.com');
    console.log("Payment email entered✅");

    //Enter card information
    await page.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242');
    console.log("Card number entered✅");

    await page.getByPlaceholder('MM / YY').fill('04/44');
    console.log("Expiry date entered✅");

    await page.getByPlaceholder('CVC').fill('444');
    console.log("CVC entered✅");

    await page.getByPlaceholder('Full name on card').fill('Example Name');
    console.log("Cardholder name entered✅");

    //Select country Lebanon
    await page.getByRole('combobox').selectOption('Lebanon');
    console.log("Country Lebanon selected✅");

    //Press pay
    await page.getByRole('button',{name: 'Pay'}).click();
    console.log("Pay button pressed✅");

    //Wait for payment processing
    await page.waitForTimeout(5000);
    console.log("Payment processing completed✅");

    //Press Continue to dashboard
    await page.getByText('Continue to dashboard').click();
    console.log("Continue to dashboard pressed✅");

    //Press Get passphrase
    await page.getByText('Get passphrase').click();
    console.log("Get passphrase pressed✅");

    //Show passphrase for 3 seconds
    await page.waitForTimeout(3000);
    console.log("Passphrase displayed for 3 seconds✅");

    //Wait for dashboard to load
    await page.waitForTimeout(3000);
    console.log("Dashboard loaded✅");

    //Go down and check payments section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    console.log("Scrolled down to payments section✅");

    //Look for payments section
    const paymentsSection = await page.locator('text=Payments, text=Payment, [data-testid="payments"]').first();
    if (await paymentsSection.isVisible()) {
        console.log("Payments section found✅");
    }


    //Go up 
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);
    console.log("Scrolled back up✅");

    //Press refill
    await page.getByText('Refill').nth(1).click();
    console.log("Refill button pressed✅");

    //Enter same card details as before
    await page.getByPlaceholder('email').fill('example@example.com');
    await page.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242');
    await page.getByPlaceholder('MM / YY').fill('04/44');
    await page.getByPlaceholder('CVC').fill('444');
    await page.getByPlaceholder('Full name on card').fill('Example Name');
    await page.getByRole('combobox').selectOption('Lebanon');
    console.log("Same card details entered for refill✅");

    //Press pay again
    await page.getByRole('button',{name: 'Pay'}).click();
    console.log("Pay button pressed for refill✅");

    //Wait for payment processing
    await page.waitForTimeout(5000);
    console.log("Refill payment processing completed✅");

    //Get passphrase
    await page.getByText('Get passphrase').click();
    console.log("Get passphrase pressed for refill✅");
    await page.waitForTimeout(3000);

    //Continue to dashboard
    await page.getByRole('button',{name: 'Continue to dashboard'}).nth(1).click();
    console.log("Continue to dashboard pressed after refill✅");

    //Wait for dashboard to load
    await page.waitForTimeout(3000);
    console.log("Dashboard loaded after refill✅");

    //Press cancel
    await page.getByText('Cancel').nth(1).click();
    console.log("Cancel button pressed✅");

    //Cancel subscription
    await page.getByText('Cancel subscription').nth(2).click();
    console.log("Cancel subscription pressed✅");
    // Wait 3s, refresh, then wait 3s
    await page.waitForTimeout(3000);
    await page.reload();
    await page.waitForTimeout(3000);
    
    //Logout
    await page.getByText('Logout').click();
    console.log("Logout completed✅");

    //Wait a moment before closing
    await page.waitForTimeout(2000);
    console.log("Test completed successfully✅");

    // Close the Proton Mail window
    await protonPage.close();
    
    //Close browser
    await page.close();
})
