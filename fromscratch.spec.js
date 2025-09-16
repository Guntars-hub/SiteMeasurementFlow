//@ts-check

import { test, expect } from '@playwright/test';



// Site measuremnt flow
test('Site measurement flow', async ({ page }) => {

    //Set test timeout 60 seconds
    test.setTimeout(60000);

    //Open webpage
    await page.goto('https://dev.explorer.dawninternet.net/');
    console.log("Browser Opened✅");

    //Press Sign up button
    await page.getByRole('button',{name: 'Sign Up'}).click();
    console.log("Sign up button pressed✅");

    //Enter email
    await page.getByPlaceholder('your@email.com').fill('gggunja@gmail.com');
    console.log("Email entered✅");

    //Submit entered email
    await page.getByText('Submit').click();
    console.log("Submit pressed✅");

    //After pasting verification code, press Continue
    await page.getByRole('button',{name: 'Continue'}).click();
    console.log("Pressed continue✅");

    //Press Site measurement
    await page.getByText('Site Measurement').click();
    console.log("Pressed Site Measurement✅");

    //Press Search Location
    await page.getByText('Search location').click()
    console.log("Pressed Search location✅");

    //Search for Riga
    await page.getByPlaceholder('Try adresses').fill('Riga');
    console.log("Entered Riga✅")

    //Press search
    await page.getByLabel('Search location').click();
    await page.waitForTimeout(1000);
    console.log("Pressed search button✅")

    //Choose first Go button, all buttons identical
    await page.getByRole('button',{name: 'Go'}).nth(0).click();
    console.log("Pressed first Go button✅")

    //Drag slider to 10 meters
    await page.locator('input[type="range"]').fill('10');
    await page.waitForTimeout(1000);
    console.log("Dragged the slider to 10 meters✅")

    //Press confirm to start measuring
    await page.getByRole('button', {name: 'Confirm'}).click();
    console.log("Pressed confirm to start measuring✅")

    //Give 10 seconds to load
    await page.waitForTimeout(10000);
    
    //Close browser
    await page.close();
})
