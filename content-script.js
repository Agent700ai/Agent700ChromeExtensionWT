/* 
 * Agent700ChromeExtensionWT
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

/* content-script */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message in content script:', request.action);
    if (request.action === 'scrape') {
        try {
            console.log('Scrape action received in content script');
            const content = extractContent();
            sendResponse({ content });
        } catch (e) {
            console.error('Error during scraping:', e);
            sendResponse({ content: '', error: e.message });
        }
    }
});

function removeScriptsAndStyles() {
    const scriptAndStyleSelectors = ['script', 'style'];
    scriptAndStyleSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => element.remove());
    });
}

function cleanTextContent(text) {
    text = text.replace(/\r\n|\r|\n/g, '\n');
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/(\n\s*\n)+/g, '\n\n');
    return text;
}

function extractContent() {
    removeScriptsAndStyles();
    let textContent = document.body.innerText;
    return cleanTextContent(textContent);
}