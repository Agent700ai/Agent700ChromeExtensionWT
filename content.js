/* 
 * Agent700ChromeExtensionWT
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

/* content-js */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "getScreenDimensions") {
      const screenDimensions = {
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      };
      sendResponse(screenDimensions);
    }
  });