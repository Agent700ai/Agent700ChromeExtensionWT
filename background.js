/* 
 * Agent700ChromeExtensionWT
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */


/** background.js **/

let activeTabs = {};

/**
 * Update the ID of the last active tab for the given window ID if it's not a chrome-extension URL.
 * @param {number} windowId - The window ID in which the tab is active.
 * @param {number} tabId - The tab ID to be checked and possibly set as last active.
 */
async function updateActiveTabId(windowId, tabId) {
    if (windowId !== chrome.windows.WINDOW_ID_NONE && tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (!tab.url.startsWith('chrome-extension://')) {
                activeTabs[windowId] = tabId;
                console.log(`Active tab updated for window ${windowId}: ${tabId}`);
            } else {
                console.error('Active tab is a chrome-extension page, not updating');
            }
        } catch (error) {
            console.error(`Failed to get tab: ${error.message}`);
        }
    } else {
        console.error('Invalid windowId or tabId, not updating');
    }
}

/**
 * Event listener for when the active tab changes.
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('Tab activated:', activeInfo);
    try {
        const windowId = activeInfo.windowId;
        const tabId = activeInfo.tabId;
        await updateActiveTabId(windowId, tabId);
    } catch (error) {
        console.error(`Error handling tab activation: ${error.message}`);
    }
});

/**
 * Event listener for when a window is focused.
 */
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    console.log(`Window focus changed: ${windowId}`);
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        console.log('No window is focused');
        return;
    }
    try {
        const [tab] = await chrome.tabs.query({ active: true, windowId });
        if (tab) {
            await updateActiveTabId(windowId, tab.id);
        } else {
            console.error('No active tab found for the focused window');
        }
    } catch (error) {
        console.error(`Error updating active tab for focused window: ${error.message}`);
    }
});

/**
 * Event listener for incoming messages.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message in background script:', request.action);
    switch (request.action) {
        case 'getLastActiveTabId':
            handleGetLastActiveTabId(sendResponse);
            break;
        case 'scrape':
            handleScrape(sendResponse);
            break;
        case 'getScreenDimensions':
            handleGetScreenDimensions(sendResponse);
            break;
        default:
            console.warn(`Unknown action: ${request.action}`);
    }
    return true; 
});

/**
 * Handle the getLastActiveTabId request.
 * @param {function} sendResponse - Function to send the response.
 */
function handleGetLastActiveTabId(sendResponse) {
    chrome.windows.getCurrent({}, (currentWindow) => {
        if (currentWindow && activeTabs.hasOwnProperty(currentWindow.id)) {
            const tabId = activeTabs[currentWindow.id];
            chrome.tabs.get(tabId, (tab) => { 
                if (chrome.runtime.lastError) {
                    console.error(`Chrome runtime error: ${chrome.runtime.lastError.message}`);
                    sendResponse({ tab: null });
                } else {
                    sendResponse({ tab: tab });
                }
            });
        } else {
            sendResponse({ tab: null });
        }
    });
}

/**
 * Handle the scrape request.
 * @param {function} sendResponse - Function to send the response.
 */
function handleScrape(sendResponse) {
    try {
        const content = extractContent();
        sendResponse({ content });
    } catch (e) {
        console.error(`Error during scraping: ${e.message}`);
        sendResponse({ content: '', error: e.message });
    }
}

/**
 * Handle the getScreenDimensions request.
 * @param {function} sendResponse - Function to send the response.
 */
function handleGetScreenDimensions(sendResponse) {
    const screenDimensions = {
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
    };
    sendResponse(screenDimensions);
}

/**
 * Remove script and style elements from the document.
 */
function removeScriptsAndStyles() {
    const scriptAndStyleSelectors = ['script', 'style'];
    scriptAndStyleSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => element.remove());
    });
}

/**
 * Clean text content by normalizing line breaks and removing unnecessary whitespace.
 * @param {string} text - The text content to be cleaned.
 * @returns {string} - The cleaned text content.
 */
function cleanTextContent(text) {
    text = text.replace(/\r\n|\r|\n/g, '\n'); // Normalize different types of line breaks to \n
    text = text.replace(/\s+/g, ' ').trim(); // Remove excessive spaces
    text = text.replace(/(\n\s*\n)+/g, '\n\n'); // Ensure paragraph breaks have double newlines
    return text;
}

/**
 * Extract the text content from the document body.
 * @returns {string} - The extracted and cleaned text content.
 */
function extractContent() {
    removeScriptsAndStyles();
    let textContent = document.body.innerText;
    return cleanTextContent(textContent);
}

/**
 * Event listener for the extension's action button click.
 */
chrome.action.onClicked.addListener(() => {
    chrome.windows.getCurrent({}, (currentWindow) => {
        if (currentWindow && currentWindow.id !== undefined) {
            chrome.sidePanel.open({
                windowId: currentWindow.id // Open in the current window
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Error opening side panel: ${chrome.runtime.lastError.message}`);
                }
            });
        } else {
            console.error("No valid current window found.");
        }
    });
});