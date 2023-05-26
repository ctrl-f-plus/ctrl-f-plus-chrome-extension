// src/utils/chromeUtils.ts

export async function queryCurrentWindowTabs(
  activeTab: boolean | undefined = undefined
): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: activeTab, currentWindow: true }, resolve);
  });
}

export async function queryWindowTabs(
  windowId?: chrome.windows.Window['id'],
  activeTab: boolean | undefined = undefined
): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    // chrome.tabs.query({ windowId, active: activeTab }, resolve);
    chrome.tabs.query({ active: activeTab, currentWindow: true }, resolve);
  });
}
