// src/background/background.ts

import {
  Messages,
  SwitchedActiveTabHideOverlay,
  SwitchedActiveTabShowOverlay,
} from '../interfaces/message.types';
import {
  executeContentScriptOnAllTabs,
  executeContentScriptWithMessage,
  getOrderedTabs,
  switchTab,
  updateMatchesCount,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
import { setStoredTabs } from '../utils/storage';
import { initStore, updateStore } from './store';

export const store = initStore();

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    const { type, payload } = message;

    switch (type) {
      // Receive message from SearchInput component
      case 'get-all-matches-msg':
        const findValue: string = message.payload;
        executeContentScriptOnAllTabs(findValue, store);
        console.log(store);
        return;
      case 'next-match':
      case 'prev-match':
        // ***2
        if (sender.tab && sender.tab.id) {
          executeContentScriptWithMessage(sender.tab.id, message.type);
        }
        return;
      case 'remove-styles-all-tabs':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'remove-styles' });
            }
          });
        });

        return;
      case 'add-styles-all-tabs':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'add-styles' });
            }
          });
        });

        return;
      case 'remove-all-highlight-matches':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          const tabPromises = tabs.map((tab) => {
            return new Promise((resolve) => {
              if (tab.id) {
                chrome.tabs.sendMessage(
                  tab.id,
                  {
                    type: 'remove-all-highlight-matches',
                  },
                  (response) => {
                    resolve(response);
                  }
                );
              } else {
                resolve(null);
              }
            });
          });

          Promise.all(tabPromises).then((responses) => {
            sendResponse(responses);
          });

          return true;
        });
        break;
      case 'switch-tab':
        switchTab(message.serializedState2);
        return;
      case 'update-tab-states-obj':
        const { serializedState2 } = message.payload;
        await setStoredTabs(serializedState2);

        store.updatedTabsCount++;

        if (store.updatedTabsCount === store.totalTabs) {
          updateMatchesCount();
          store.updatedTabsCount = 0; // Reset the count for future updates
        }

        sendResponse({ status: 'success' });
        return;
      default:
        break;
    }
  }
);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // TODO:(***101):This would be better if it only ran on stored tabs
  // const storedTabs = await getAllStoredTabs();
  // const matchesObject = storedTabs;
  // const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));

  // debugger;

  // const orderedTabs = arrangeTabs(tabs, tabId);
  // const orderedTabIds = arrangeTabs(tabIds, tabId);
  // TODO:(***101): Here
  const orderedTabs = await getOrderedTabs();

  // chrome.tabs.sendMessage(tabId, {
  //   from: 'background',
  //   type: 'tab-activated',
  // });

  const message1: SwitchedActiveTabShowOverlay = {
    // TODO:reset currentIndex so that when you hit next on the new tab it highlights the first match on that page
    from: 'background',
    type: 'switched-active-tab-show-overlay',
  };
  chrome.tabs.sendMessage(tabId, message1);

  const inactiveTabs = orderedTabs.filter((tab) => tab.id !== tabId);

  for (const otherTab of inactiveTabs) {
    if (otherTab.id) {
      const message2: SwitchedActiveTabHideOverlay = {
        from: 'background',
        type: 'switched-active-tab-hide-overlay',
      };
      chrome.tabs.sendMessage(otherTab.id, message2);
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  // TODO:REVIEW `active:currentWindow: true` below:
  // chrome.tabs.query({}, (tabs) => {
  if (command === 'toggle_search_overlay') {
    // chrome.tabs.query({ active:currentWindow: true }, (tabs) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { command });
      }
    });
  }
});

// chrome.tabs.onCreated.addListener(updateTotalTabsCount);
chrome.tabs.onCreated.addListener(() => {
  updateTotalTabsCount();
});

// chrome.tabs.onRemoved.addListener(updateTotalTabsCount);
chrome.tabs.onRemoved.addListener(() => {
  updateTotalTabsCount();
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  const focusedWindow = await new Promise<chrome.windows.Window>((resolve) => {
    chrome.windows.get(windowId, resolve);
  });

  if (
    store.lastFocusedWindowId !== windowId &&
    (focusedWindow as chrome.windows.Window).type === 'normal'
  ) {
    updateTotalTabsCount();
    store.updatedTabsCount = 0;
  }

  store.lastFocusedWindowId = windowId;
});
