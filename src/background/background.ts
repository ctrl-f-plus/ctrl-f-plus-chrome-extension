// src/background/background.ts

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

function executeContentScriptWithMessage(
  tabId: number,
  messageType: string,
  findValue: string
) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, { type: messageType, findValue });
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
    let foundMatch = false;

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
              if (!foundMatch) {
                foundMatch = true;
                chrome.tabs.update(nextTab.id, { active: true });
              }
              return;
            }
          }
        );
      }
    }
  });
}

function navigateToPreviousTabWithMatch() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    let activeTabIndex = tabs.findIndex((tab) => tab.active);
    let foundMatch = false;

    for (let i = 1; i <= tabs.length; i++) {
      let previousTab = tabs[(activeTabIndex - i + tabs.length) % tabs.length];
      if (previousTab.id) {
        chrome.tabs.sendMessage(
          previousTab.id,
          { type: 'previous-match' },
          (response) => {
            if (chrome.runtime.lastError) {
              // Ignore this error
            } else if (response.hasMatch) {
              if (!foundMatch) {
                foundMatch = true;
                chrome.tabs.update(previousTab.id, { active: true });
              }
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
    executeContentScriptWithMessage(
      sender.tab!.id,
      message.type,
      message.findValue
    );
  }

  if (message.type === 'highlight-matches') {
    const findValue = message.findValue;
    executeContentScriptOnCurrentTab(findValue);
  } else if (message.type === 'next-match') {
    // TODO: Review - see if you can update so that it doesn't switch tabs every time.
    navigateToNextTabWithMatch();
  } else if (message.type === 'previous-match') {
    navigateToPreviousTabWithMatch();
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  console.log('Activated tab:', tabId);
  chrome.tabs.sendMessage(tabId, { type: 'tab-activated' });
});
