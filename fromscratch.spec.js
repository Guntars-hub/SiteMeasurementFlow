//@ts-check

import { test, expect } from '@playwright/test';



// Site measuremnt flow
test('Site measurement flow', async ({ page }) => {

    //Set test timeout 60 seconds
    test.setTimeout(60000);

    //Open webpage
    await page.goto('https://dev.explorer.dawninternet.net/');

    //Press Sign up button
    await page.getByRole('button',{name: 'Sign Up'}).click();

    //Enter email
    await page.getByPlaceholder('your@email.com').fill('gggunja@gmail.com');

    //Submit entered email
    await page.getByText('Submit').click();

    //After pasting verification code, press Continue
    await page.getByRole('button',{name: 'Continue'}).click();

    //Press Site measurement
    await page.getByText('Site Measurement').click();

    //Press Search Location
    await page.getByText('Search location').click()

    //Search for Riga
    await page.getByPlaceholder('Try adresses').fill('Riga');

    //Press search
    await page.getByLabel('Search location').click();
    await page.waitForTimeout(1000);

    //Choose first Go button, all buttons identical
    await page.getByRole('button',{name: 'Go'}).nth(0).click();

    //Drag slider to 10 meters
    await page.locator('input[type="range"]').fill('10');
    await page.waitForTimeout(1000);
    
    //Press confirm to start measuring
    await page.getByRole('button', {name: 'Confirm'}).click();

    //Give 120 seconds to load
    await page.waitForTimeout(20000);
    
    //Close browser
    await page.close();
})
