const { chromium } = require('playwright');

async function signupWithVerification() {
  const browser = await chromium.launch({ headless: false }); // set to true for headless
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Open Explorer site
    await page.goto("https://dev.explorer.dawninternet.net/explorer");
    console.log("🌐 Opened Explorer site");

    // Step 2: Click "Sign in"
    await page.click("span:has-text('Sign in')");
    console.log("✔ Clicked Sign in");

    // Step 3: Click "Sign up"
    await page.click("button:has-text('Sign up')");
    console.log("✔ Clicked Sign up");

    // Step 4: Wait for email input
    const emailInput = await page.waitForSelector("input[type='email']");
    console.log("✔ Found email input field");

    // Step 5: Open temp-mail.org in new tab
    const tempPage = await context.newPage();
    await tempPage.goto("https://temp-mail.org/");
    console.log("🌐 Opened temp-mail.org");

    // Step 6: Get generated email
    await tempPage.waitForSelector("#mail");
    const email = await tempPage.$eval("#mail", el => el.value);
    console.log("📧 Temp email:", email);

    // Step 7: Paste email back into Explorer
    await page.fill("input[type='email']", email);
    console.log("✔ Pasted email");

    // Step 8: Click Submit button
    await page.click("button.StyledEmbeddedButton-sc-3253171f-6");
    console.log("✔ Clicked Submit button");

    // Step 9: Wait for verification code input
    await page.waitForSelector("input[type='text']");
    console.log("✔ Found verification code input field");

    // Step 10: Get verification email
    await tempPage.waitForTimeout(10000); // wait 10s for email
    await tempPage.click(".inbox-dataList .inbox-dataList-item"); // open newest email
    const msgBody = await tempPage.textContent(".inboxSubject");
    console.log("📨 Email subject:", msgBody);

    // Step 11: Extract verification code
    const codeMatch = msgBody.match(/\b\d{4,8}\b/);
    if (!codeMatch) throw new Error("❌ Could not find verification code");
    const code = codeMatch[0];
    console.log("🔑 Verification code:", code);

    // Step 12: Enter code into Explorer
    await page.fill("input[type='text']", code);
    console.log("✔ Entered verification code");

    // Step 13: Press Continue
    await page.click("button:has-text('Continue')");
    console.log("✔ Clicked Continue");

    // Step 14: Press Site Measurement
    await page.click("span:has-text('Site Measurement')");
    console.log("✔ Clicked Site Measurement");

    // Step 15: Press Search Location
    await page.click("span:has-text('Search location')");
    console.log("✔ Clicked Search Location");

    // Step 16: Enter Riga in search input
    await page.fill("input[placeholder='Try adresses']", "Riga");
    console.log("✔ Typed Riga");

    // Step 17: Click magnifying glass button
    await page.click("button[aria-label='Search location']");
    console.log("✔ Clicked magnifying glass");

    // Step 18: Click Go button
    await page.click("button:has-text('Go')");
    console.log("✔ Clicked Go");

    await page.waitForTimeout(5000);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await browser.close();
  }
}

signupWithVerification();
