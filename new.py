from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time, re



def signup_with_verification():
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 30)

    try:
        # Step 1: Open Explorer site
        driver.get("https://dev.explorer.dawninternet.net/explorer")
        print("🌐 Opened Explorer site")
        driver.implicitly_wait(5)

        # Step 2: Click "Sign in"
        signin_spans = driver.find_elements(By.XPATH, "//span[contains(text(),'Sign in')]")
        for s in signin_spans:
            if "Sign in" in s.text:
                driver.execute_script("arguments[0].click();", s)
                print("✔ Clicked Sign in")
                break

        # Step 3: Click "Sign up"
        signup_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Sign up']"))
        )
        driver.execute_script("arguments[0].click();", signup_btn)
        print("✔ Clicked Sign up")

        # Step 4: Wait for email input
        email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        print("✔ Found email input field")

        # Step 5: Open temp-mail.org in new tab
        driver.execute_script("window.open('https://temp-mail.org/', '_blank');")
        driver.switch_to.window(driver.window_handles[-1])
        print("🌐 Opened temp-mail.org")
        time.sleep(10)

        # Step 6: Get generated email
        email_el = wait.until(EC.presence_of_element_located((By.ID, "mail")))
        email = email_el.get_attribute("value")
        print("📧 Temp email:", email)

        # Step 7: Switch back to Explorer and paste email
        driver.switch_to.window(driver.window_handles[0])
        email_input.send_keys(email)
        print("✔ Pasted email")
        time.sleep(3)

        # Step 8: Submit form (more reliable locator)
        submit_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[normalize-space(text())='Submit']]"))
        )
        driver.execute_script("arguments[0].click();", submit_btn)
        print("✔ Clicked Submit button")

        # Step 9: Wait for verification code input
        code_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='text' or @name='verificationCode']"))
        )
        print("✔ Found verification code input field")
        # Step 10: Switch back to temp-mail and wait for email
        driver.switch_to.window(driver.window_handles[1])
        print("📨 Waiting for verification email...")
        time.sleep(10)  # wait for email to arrive

        # Scroll down a little to make sure email is visible
        driver.execute_script("window.scrollBy(0, 400);")
        time.sleep(2)

        # Find subject span with login code
        subject_span = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//span[contains(text(),'login code')]")
            )
        )

        # Try both text and innerText for reliability
        subject_text = subject_span.text.strip()
        if not subject_text:
            subject_text = subject_span.get_attribute("innerText").strip()

        print("📨 Raw subject text from email:", subject_text)

        # Step 11: Extract verification code from subject text
        code_match = re.search(r"\b\d{4,8}\b", subject_text)
        if not code_match:
            raise Exception("❌ Could not find verification code in subject text")
        code = code_match.group(0)
        print("🔑 Verification code:", code)

         # Step 12: Switch back to Explorer and paste code
        driver.switch_to.window(driver.window_handles[0])
        code_input.send_keys(code)
        print("✔ Entered verification code")

        # Step 13: Click Continue button
        continue_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Continue']"))
        )
        driver.execute_script("arguments[0].click();", continue_btn)
        print("✔ Clicked Continue button")

        # Step 14: Click Site Measurement
        site_measurement_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//*[normalize-space()='Site Measurement']"))
        )
        driver.execute_script("arguments[0].click();", site_measurement_btn)
        print("✔ Clicked Site Measurement")
        time.sleep(5)

        # Step 15: Click Search Location
        search_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[.//span[normalize-space(text())='Search location']]"))
        )
        driver.execute_script("arguments[0].click();", search_btn)
        print("✔ Clicked Search location")

         # Step 16: Enter "Riga" in Search Location input, click magnifying glass, then Go
        search_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Try adresses']"))
        )
        search_input.clear()
        search_input.send_keys("Riga")
        time.sleep(1)  # small delay so it registers
        print("✔ Typed 'Riga'")

        # Click magnifying glass button
        magnify_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Search location']"))
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", magnify_btn)
        driver.execute_script("arguments[0].click();", magnify_btn)
        print("✔ Clicked magnifying glass button")

        # Click Go button
        go_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Go']"))
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", go_btn)
        driver.execute_script("arguments[0].click();", go_btn)
        print("✔ Clicked Go button")

        time.sleep(30)

    finally:
        driver.quit()


if __name__ == "__main__":
    signup_with_verification()
