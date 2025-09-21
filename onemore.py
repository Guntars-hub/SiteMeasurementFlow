from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time, re

def safe_click(driver, wait, locator, retries=5, desc="button"):
    """
    Tries multiple times to click an element until it disappears or succeeds.
    """
    for attempt in range(1, retries+1):
        try:
            elem = wait.until(EC.element_to_be_clickable(locator))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", elem)
            driver.execute_script("arguments[0].click();", elem)
            print(f"✔ Clicked {desc} (attempt {attempt})")
            time.sleep(2)
            # If element disappears, success
            try:
                if not elem.is_displayed():
                    return True
            except:
                return True
        except Exception as e:
            print(f"⚠ {desc} click attempt {attempt} failed: {e}")
            time.sleep(2)
    raise Exception(f"❌ Could not click {desc} after {retries} attempts")

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
        safe_click(driver, wait, (By.XPATH, "//button[normalize-space()='Sign up']"), desc="Sign up")

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

        # Step 8: Submit form
        safe_click(driver, wait, (By.XPATH, "//button[.//span[text()='Submit']]"), desc="Submit")

        # Step 9: Wait for verification code input
        code_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='text' or @name='verificationCode']")))
        print("✔ Found verification code input field")

        # Step 10: Switch back to temp-mail and wait for email
        driver.switch_to.window(driver.window_handles[1])
        print("📨 Waiting for verification email...")
        time.sleep(10)  # extra wait before looking
        mail_item = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".inbox-dataList .inbox-dataList-item")))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", mail_item)
        mail_item.click()
        print("✔ Opened verification email")

        # Step 11: Extract verification code from subject
        subject_el = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".inboxSubject")))
        subject_text = subject_el.text
        print("📨 Email subject:", subject_text)
        code_match = re.search(r"\b\d{4,8}\b", subject_text)
        if not code_match:
            raise Exception("❌ Could not find verification code in subject")
        code = code_match.group(0)
        print("🔑 Verification code:", code)

        # Step 12: Switch back to Explorer and paste code
        driver.switch_to.window(driver.window_handles[0])
        code_input.send_keys(code)
        print("✔ Entered verification code")

        # Step 13: Press Continue
        safe_click(driver, wait, (By.XPATH, "//button[.//span[text()='Continue']]"), desc="Continue")

        # Step 14: Press Site Measurement
        safe_click(driver, wait, (By.XPATH, "//span[normalize-space()='Site Measurement']"), desc="Site Measurement")

        # Step 15: Press Search Location
        safe_click(driver, wait, (By.XPATH, "//span[normalize-space()='Search location']"), desc="Search Location")

        # Step 16: Enter "Riga" into location search
        location_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Try adresses']")))
        location_input.send_keys("Riga\n")
        print("✔ Entered Riga and pressed Enter")

        time.sleep(10)

    finally:
        driver.quit()

if __name__ == "__main__":
    signup_with_verification()
