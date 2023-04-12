// src/background/background.ts

import {
  Messages,
  ExecuteContentScript,
  GetAllMatchesRequest,
} from '../utils/messages';

const allMatches: { [tabId: number]: HTMLElement[] } = {};

function executeContentScript(findValue: string) {
  console.log('executeContentScript');
  // debugger;
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ['getInnerHtmlScript.js'],
          },
          () => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'highlight',
              findValue: findValue,
              tabId: tab.id,
            });
          }
        );
      }
    });
  });
}

function executeContentScriptWithMessage(
  tabId: number,
  messageType: string,
  findValue: string
) {
  console.log('executeContentScriptWithMessage');
  // debugger;
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, { type: messageType, findValue, tabId });
    }
  );
}

// TODO: Add Settings option to allow the toggling of currentWindow
function executeContentScriptOnAllTabs(findValue: string) {
  console.log('executeContentScriptOnAllTabs(findValue: string)');
  // debugger;
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        executeContentScript(findValue);
      }
    }
  });
}

function executeContentScriptOnCurrentTab(findValue: string) {
  console.log('executeContentScriptOnCurrentTab(findValue: string)');
  // debugger;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.id) {
      executeContentScript(findValue);
    }
  });
}

function navigateToNextTabWithMatch() {
  console.log('navigateToNextTabWithMatch()');
  // debugger;
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
                if (response.tabId === nextTab.id) {
                  chrome.tabs.update(nextTab.id, { active: true });
                }
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
  console.log('navigateToPreviousTabWithMatch()');
  // debugger;
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    let activeTabIndex = tabs.findIndex((tab) => tab.active);
    let foundMatch = false;

    for (let i = 1; i <= tabs.length; i++) {
      let previousTab = tabs[(activeTabIndex - i + tabs.length) % tabs.length];
      if (previousTab.id) {
        chrome.tabs.sendMessage(
          previousTab.id,
          { type: 'prev-match' },
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

// TODO: decide if you need/want this on each if statement: `message.from === 'content' &&`
// TODO: Review - see if you can update so that it doesn't switch tabs every time.
chrome.runtime.onMessage.addListener((message: Messages, sender) => {
  if (message.type === 'get-all-matches-req') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { type: 'get-all-matches-req' });
      }
    });

    return;
  }

  if (message.type === 'get-inner-html' && message.payload) {
    const { tabId, title, matches } = message.payload;
    allMatches[tabId] = matches;

    return;
  }

  if (message.type === 'execute-content-script') {
    const findValue = message.payload;
    executeContentScriptOnAllTabs(findValue);

    return;
  }

  if (message.type === 'highlight-matches') {
    const findValue = message.findValue;
    executeContentScriptOnCurrentTab(findValue);

    return;
  }

  if (message.type === 'get-all-matches-msg') {
    const findValue = message.findValue;
    executeContentScriptOnCurrentTab(findValue);
    chrome.runtime.sendMessage({ type: 'all-matches', allMatches });

    return;
  }

  // FIXME: Should be able to modify this to remove the second if block
  if (message.type === 'next-match' || message.type === 'prev-match') {
    executeContentScriptWithMessage(
      sender.tab!.id,
      message.type,
      message.findValue
    );
  }

  if (message.type === 'next-match') {
    navigateToNextTabWithMatch();
  } else if (message.type === 'prev-match') {
    navigateToPreviousTabWithMatch();
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  console.log('Activated tab:', tabId);
  chrome.tabs.sendMessage(tabId, { type: 'tab-activated' });
});
