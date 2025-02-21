chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel && chrome.sidePanel.setOptions) {
    try {
      await chrome.sidePanel.setOptions({ path: "asidebar.html", enabled: true });
    } catch (error) {
      console.error("Error enabling side panel:", error);
    }
  } else {
    console.warn("Side panel API is not available, opening in a new tab instead");
    try {
      await chrome.tabs.create({ url: chrome.runtime.getURL("asidebar.html") });
    } catch (error) {
      console.error("Error opening alternative tab:", error);
    }
  }
});