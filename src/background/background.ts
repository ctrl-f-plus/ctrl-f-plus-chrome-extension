// start / src / background / background.ts;
import { Messages, ExecuteContentScript } from '../utils/messages';

function executeContentScript(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    // files: ['contentScript.js'],
    files: ['getInnerHtmlScript.js'],
  });
}

function executeContentScriptOnAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        executeContentScript(tab.id);
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message: Messages, sender) => {
  if (message.from === 'content' && message.type === 'get-inner-html') {
    console.log(`Tab ID: ${sender.tab!.id}, InnerHTML: ${message.payload}`);
  }

  if (message.from === 'content' && message.type === 'execute-content-script') {
    executeContentScriptOnAllTabs();
  }
});
