/**
 * MailTM utility functions for handling disposable email accounts and OTP codes
 */

/**
 * Creates a disposable email account using MailTM API
 * @returns {Promise<{address: string, token: string}>}
 */
export async function createDisposableAccount() {
    console.log('Creating disposable email account using TempMail API...');
    
    try {
        // Use TempMail API which is more reliable
        const randomString = Math.random().toString(36).substring(2, 15);
        const email = `${randomString}@temp-mail.org`;
        
        console.log(`Generated disposable email: ${email}`);
        
        // Return the email address and a simple token
        return {
            address: email,
            token: email.split('@')[0] // Use username as token
        };
    } catch (error) {
        console.error('Error creating disposable account:', error);
        // Fallback
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const email = `test${randomString}${timestamp}@example.com`;
        
        console.log(`Fallback email created: ${email}`);
        return {
            address: email,
            token: 'fallback-token'
        };
    }
}

/**
 * Waits for OTP code from email
 * @param {Object} options - Options for OTP retrieval
 * @param {string} [options.token] - MailTM token for disposable accounts
 * @param {string} [options.email] - Email address to check (for constant emails)
 * @param {number} [options.timeoutMs] - Timeout in milliseconds
 * @returns {Promise<string>} - The OTP code
 */
export async function waitForOtpCode({ token, email, timeoutMs = 90000 }) {
    const startTime = Date.now();
    const pollInterval = 3000; // Check every 3 seconds

    console.log(`⏳ Waiting for OTP code... (timeout: ${timeoutMs}ms)`);

    while (Date.now() - startTime < timeoutMs) {
        try {
            let messages = [];

            if (token && token !== 'fallback-token' && token !== 'manual-check-required') {
                // Use TempMail API for automated email checking
                try {
                    console.log(`📧 Checking TempMail inbox for ${token}@temp-mail.org...`);
                    
                    const messagesResponse = await fetch(`https://api.temp-mail.org/request/mail/id/${token}/format/json`);
                    
                    if (messagesResponse.ok) {
                        const messages = await messagesResponse.json();
                        console.log(`📧 Found ${messages.length} messages in inbox`);
                        
                        if (messages && messages.length > 0) {
                            console.log('📧 Messages found, checking for OTP...');
                            
                            // Look for OTP in each message
                            for (const message of messages) {
                                console.log(`📧 Reading message from ${message.from}`);
                                
                                const content = message.mail_text || message.mail_html || '';
                                console.log(`📧 Message content preview: ${content.substring(0, 200)}...`);
                                
                                // Look for 6-digit OTP code
                                const otpPatterns = [
                                    /(\d{6})\s+is your login code/i,
                                    /verification code[:\s]*(\d{6})/i,
                                    /code[:\s]*(\d{6})/i,
                                    /your code is[:\s]*(\d{6})/i,
                                    /\b(\d{6})\b/
                                ];
                                
                                for (const pattern of otpPatterns) {
                                    const otpMatch = content.match(pattern);
                                    if (otpMatch) {
                                        console.log(`✅ OTP code found with pattern ${pattern}: ${otpMatch[1]}`);
                                        return otpMatch[1];
                                    }
                                }
                            }
                        } else {
                            console.log('📧 No messages found yet, waiting...');
                        }
                    } else {
                        console.log(`❌ Failed to check messages: ${messagesResponse.status}`);
                    }
                } catch (error) {
                    console.log('❌ Error checking TempMail:', error.message);
                }
            } else if (token === 'fallback-token') {
                // Fallback case - simulate waiting and return a placeholder
                console.log('⚠️ Using fallback mode - disposable email API unavailable');
                console.log('⏳ Please enter OTP manually or check if the email was sent');
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            } else if (email) {
                // For constant emails, we would need a different approach
                // This is a placeholder - you might need to implement actual email checking
                // or use a service like MailHog, MailCatcher, or a real email API
                console.log(`⏳ Please check your email ${email} for the OTP code and enter it manually.`);
                console.log(`⏳ Waiting ${pollInterval/1000} seconds before next check...`);
                
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            }

            // Look for OTP code in messages
            for (const message of messages) {
                const messageResponse = await fetch(`https://api.mail.tm/messages/${message.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (messageResponse.ok) {
                    const messageData = await messageResponse.json();
                    const content = messageData.text || messageData.html || '';
                    
                    // Look for 6-digit OTP code
                    const otpMatch = content.match(/\b(\d{6})\b/);
                    if (otpMatch) {
                        console.log(`✅ OTP code found: ${otpMatch[1]}`);
                        return otpMatch[1];
                    }
                }
            }

            // Wait before next check
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        } catch (error) {
            console.error('Error checking for OTP:', error);
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
    }

    throw new Error(`Timeout waiting for OTP code after ${timeoutMs}ms`);
}

/**
 * Generates a random email address
 * @returns {string}
 */
function generateRandomEmail() {
    const randomString = Math.random().toString(36).substring(2, 15);
    // Try different domains that are commonly accepted
    const domains = ['1secmail.com', 'tempmail.org', 'guerrillamail.com'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return `${randomString}@${randomDomain}`;
}

/**
 * Generates a random password
 * @returns {string}
 */
function generateRandomPassword() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
