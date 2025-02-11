/* 
 * Agent700ChromeExtensionWT
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */


/* login.js */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
  
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        try {
            const response = await fetch('https://agent700.ai/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
  
            if (!response.ok) {
                throw new Error(`Login failed with status ${response.status}`);
            }
  
            const data = await response.json();
            const token = data.accessToken;
  
            chrome.storage.local.set({ agent700ApiToken: token }, () => {
                loginMessage.textContent = 'Login successful!';
                chrome.sidePanel.setOptions({ path: 'sidebar.html' }, () => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    }
                    window.location.href = 'sidebar.html'; // Redirect to sidebar after successful login
                });
            });
        } catch (error) {
            console.error('Login error:', error);
            loginMessage.textContent = 'Login failed. Please try again.';
        }
    });
  });