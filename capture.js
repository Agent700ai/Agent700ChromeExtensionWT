/* 
 * Agent700ChromeExtensionWT
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

/* Capture.js */

console.log('capture.js loaded');

// Include the is_logged_in function
async function is_logged_in(token) {
    const AGENTS_URL = 'https://agent700.ai/api/agents';

    try {
        let response = await fetch(AGENTS_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            return true;
        } else {
            throw new Error('Not logged in');
        }
    } catch (error) {
        console.error('Error in is_logged_in:', error);
        return false;
    }
}

async function initializeCapture() {
    console.log('Capture initialized!');

    const captureButton = document.getElementById('capture-button');
    const scrapedUrlElement = document.getElementById('scraped-url');
    const scrapedContentElement = document.getElementById('scraped-content');
    const addToLibraryButton = document.getElementById('add-to-library-button');
    const successMessageElement = document.getElementById('success-message');
    const errorMessageElement = document.getElementById('error-message');

    // Check login status
    const token = await getApiToken();
    const loggedIn = await is_logged_in(token);

    if (!loggedIn) {
        console.log('User not logged in, redirecting to login.');
        window.location.href = 'login.html';
        return;
    }

    if (captureButton) {
        console.log('Capture button found');
        captureButton.addEventListener('click', captureContent);
    } else {
        console.error('Capture button not found');
    }

    function adjustContentDimensions() {
        const container = document.querySelector('.container');
        const content = document.querySelector('.content');
    
        // Adjust content height and width as per container dimensions
        content.style.height = `${container.clientHeight - 20}px`; 
        content.style.width = `calc(100% - 10px)`;
    }
    
    window.addEventListener('resize', adjustContentDimensions);
    document.addEventListener('DOMContentLoaded', adjustContentDimensions);

    function captureContent() {
        console.log('Capture button clicked');
        chrome.runtime.sendMessage({ action: 'getLastActiveTabId' }, function(response) {
            console.log('Received response for getLastActiveTabId:', response);
            const tab = response.tab;

            if (tab) {
                console.log('Active tab found:', tab);
                let title = tab.title;
                title = title.replace(/[^a-z0-9.]/gi, ' ').toLowerCase();
                title = toCamelCase(title);
                title = `captured.${title}`; 

                // Reset the title flag before setting the new title
                document.getElementById('scraped-url').value = title;

                chrome.scripting.executeScript(
                    {
                        target: { tabId: tab.id },
                        files: ['content-script.js']
                    },
                    () => {
                        if (chrome.runtime.lastError) {
                            console.error('Error executing content script:', chrome.runtime.lastError.message);
                            return;
                        }

                        console.log('Content script executed successfully.');
                        chrome.tabs.sendMessage(tab.id, { action: "scrape" }, function(response) {
                            if (chrome.runtime.lastError) {
                                console.error('Error sending message to content script:', chrome.runtime.lastError.message);
                                return;
                            }

                            if (response && response.content) {
                                console.log('Content script response received:', response.content);
                                const xmlContent = `<${title}>\n  <Text>\n${response.content}\n  </Text>\n</${title}>`;
                                document.getElementById('scraped-content').value = xmlContent;
                                document.getElementById('add-to-library-button').disabled = document.getElementById('scraped-url').value.trim() === '';
                            } else {
                                console.error('No content received from content script');
                                document.getElementById('add-to-library-button').disabled = true;
                            }

                            if (response && response.error) {
                                console.error('Scraping Error:', response.error);
                            }
                        });
                    }
                );
            } else {
                console.error('No active tab found');
            }
        });
    }

    function toCamelCase(str) {
        return str
            .replace(/[^a-z0-9.]/gi, ' ')
            .replace(/\s(.)/g, function(match, group1) { 
                return group1.toUpperCase();
            }) 
            .replace(/\s/g, '') 
            .replace(/^(.)/, function(match, group1) {
                return group1.toLowerCase();
            }); 
    }

    function isValidTitle(title) {
        return /^[a-z0-9_.]+$/i.test(title);
    }

    chrome.storage.local.get('agent700ApiToken', function(result) {
        const token = result.agent700ApiToken;

        if (!token) {
            console.log('No API token found, redirecting to login.');
            window.location.href = 'login.html';
            return;
        }

        addToLibraryButton.disabled = true;

        addToLibraryButton.addEventListener('click', function() {
            const key = scrapedUrlElement.value;
            const content = scrapedContentElement.value;

            if (!isValidTitle(key)) {
                errorMessageElement.textContent = 'Title Entry Error: Only letters, numbers, underscores, and periods allowed.';
                errorMessageElement.style.display = 'block';
                setTimeout(() => {
                    errorMessageElement.style.display = 'none';
                }, 5000);
                return;
            }

            console.log('Adding data to library:', { key, content });
            fetch('https://agent700.ai/api/alignment-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    key: key,
                    value: content
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(`API request failed: ${errData.message || 'Unknown error'}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Data sent to Agent700:', data);
                addToLibraryButton.disabled = true;

                successMessageElement.textContent = 'Data added successfully!';
                successMessageElement.style.display = 'block';
                errorMessageElement.style.display = 'none';

                scrapedUrlElement.value = '';
                scrapedContentElement.value = '';

                setTimeout(() => {
                    successMessageElement.style.display = 'none';
                }, 3000);
            })
            .catch(error => {
                console.error('Error adding data:', error);

                errorMessageElement.textContent = `Error: ${error.message}`;
                errorMessageElement.style.display = 'block';
                successMessageElement.style.display = 'none';

                setTimeout(() => {
                    errorMessageElement.style.display = 'none';
                }, 5000);
            });
        });

        scrapedUrlElement.addEventListener('input', function(event) {
            addToLibraryButton.disabled = scrapedContentElement.value.trim() === '' || scrapedUrlElement.value.trim() === '';
        });

        scrapedUrlElement.addEventListener('blur', function(event) {
            let title = scrapedUrlElement.value;

            if (!isValidTitle(title)) {
                errorMessageElement.textContent = 'Title: Only letters, numbers, underscores, and periods allowed.';
                errorMessageElement.style.display = 'block';
                addToLibraryButton.disabled = true;
            } else {
                errorMessageElement.style.display = 'none';
                addToLibraryButton.disabled = scrapedContentElement.value.trim() === '' || scrapedUrlElement.value.trim() === '';
            }
        });
    });

} // End of initializeCapture function

window.initializeCapture = initializeCapture;

console.log('initializeCapture function defined:', typeof initializeCapture);

async function getApiToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('agent700ApiToken', function(result) {
            if (result.agent700ApiToken) {
                //console.log('Token retrieved:', result.agent700ApiToken); // Add debug log
                resolve(result.agent700ApiToken);
            } else {
                console.error('No API token found'); // Add error log
                reject('No API token found');
            }
        });
    });
}