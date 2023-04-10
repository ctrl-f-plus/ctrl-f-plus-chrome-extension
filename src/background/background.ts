// start / src / background / background.ts;
import { Messages, ExecuteContentScript } from '../utils/messages';

function executeContentScript(tabId: number, findValue: string) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, { type: 'highlight', findValue });
    }
  );
}

function executeContentScriptWithMessage(tabId: number, messageType: string) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, { type: messageType });
    }
  );
}

// TODO: Add Settings option to allow the toggling of currentWindow
function executeContentScriptOnAllTabs(findValue: string) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        executeContentScript(tab.id, findValue);
      }
    }
  });
}

function executeContentScriptOnCurrentTab(findValue: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.id) {
      executeContentScript(tab.id, findValue);
    }
  });
}

function navigateToNextTabWithMatch() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    let activeTabIndex = tabs.findIndex((tab) => tab.active);

    for (let i = 1; i <= tabs.length; i++) {
      let nextTab = tabs[(activeTabIndex + i) % tabs.length];
      if (nextTab.id) {
        chrome.tabs.sendMessage(
          nextTab.id,
          { type: 'next-match' },
          (response) => {
            if (chrome.runtime.lastError) {
              // Ignore this error
            } else if (response.hasMatch) {
              chrome.tabs.update(nextTab.id, { active: true });
              return;
            }
          }
        );
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message: Messages, sender) => {
  if (
    message.from === 'content' &&
    message.type === 'get-inner-html' &&
    message.payload
  ) {
    const { title, innerHtml } = message.payload;
  }

  if (message.from === 'content' && message.type === 'execute-content-script') {
    const findValue = message.payload;
    executeContentScriptOnAllTabs(findValue);
  } else if (
    message.from === 'content' &&
    (message.type === 'next-match' || message.type === 'previous-match')
  ) {
    executeContentScriptWithMessage(sender.tab!.id, message.type);
  }

  if (message.type === 'highlight-matches') {
    const findValue = message.findValue;
    executeContentScriptOnCurrentTab(findValue);
  } else if (message.type === 'next-match') {
    navigateToNextTabWithMatch();
  } else if (message.type === 'previous-match') {
    // Implement previous match tab navigation if needed
  }
});
