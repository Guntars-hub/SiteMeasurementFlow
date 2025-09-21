from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def check_hp_warranty(serial_numbers):
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 15)

    try:
        driver.get("https://support.hp.com/lv-en/check-warranty")
        print("✅ Opened HP Warranty Check page.")

        # Accept cookies
        try:
            accept_cookies_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Accept')]")))
            accept_cookies_button.click()
            print("Accepted cookies.")
        except:
            print("⚠️ No cookie acceptance button found or already accepted, continuing...")

        for sn in serial_numbers:
            # Wait for input field on the main page
            input_field = wait.until(EC.presence_of_element_located((By.ID, "inputtextpfinder")))
            submit_button = wait.until(EC.presence_of_element_located((By.ID, "FindMyProduct")))

            # Clear and enter serial number
            input_field.clear()
            input_field.send_keys(sn)
            print(f"Entered serial number: {sn}")

            # Wait for submit button enabled and click
            wait.until(lambda d: submit_button.is_enabled())
            submit_button.click()
            print("Clicked Submit button.")

            # Wait for new page to load — here wait for something on result page
            # Example: waiting for an element unique to the result page
            try:
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".product-details, .error-message")))
                print(f"Result page loaded for serial: {sn}")
            except:
                print(f"Warning: Result page might not have loaded properly for serial: {sn}")

            # Pause to let user or site load data fully (optional)
            #time.sleep(2)

            # Go back to the warranty check input page
            driver.back()
            print("Navigated back to input page.")

            # Wait for input field to be present again before next loop
            wait.until(EC.presence_of_element_located((By.ID, "inputtextpfinder")))

    finally:
        print("Closing browser in 3 seconds...")
        time.sleep(3)
        driver.quit()


if __name__ == "__main__":
    serials = [
        "CNK4080DH6",
        "CNK4080DH7",
        "CNK4080DH8",
        "CNK4080DH9",
        "CNK4080DHA",
        "CNK4080DHB",
        "CNK4080DHC",
        "CNK4080DHD",
        "CNK4080DHE",
        "CNK4080DHF",
    ]
    check_hp_warranty(serials)
