// src/background/queryTabs.ts

import {
  executeContentScript,
  executeContentScriptWithMessage,
} from './executeContentScript';

interface ExecuteContentScriptOnAllTabsProps {
  findValue: string;
}

// TODO: Add Settings option to allow the toggling of currentWindow
export const executeContentScriptOnAllTabs = (
  props: ExecuteContentScriptOnAllTabsProps
) => {
  const { findValue } = props;

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        executeContentScript({ tabId: tab.id, findValue: findValue });
      }
    }
  });
};

interface ExecuteContentScriptOnCurrentTabProps {
  findValue: string;
}

export const executeContentScriptOnCurrentTab = (
  props: ExecuteContentScriptOnCurrentTabProps
) => {
  const { findValue } = props;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.id) {
      executeContentScript({ tabId: tab.id, findValue: findValue });
    }
  });
};

export const navigateToNextTabWithMatch = () => {
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
};

export const navigateToPreviousTabWithMatch = () => {
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
};

// export { executeContentScriptWithMessage };
