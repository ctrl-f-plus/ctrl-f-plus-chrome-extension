export const setupTabActivationListener = () => {
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    console.log('Activated tab:', tabId);
    chrome.tabs.sendMessage(tabId, { type: 'tab-activated' });
  });
};
