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
import { initStore, resetStore, updateStore } from './store';

export const store = initStore();

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    const { type, payload } = message;

    switch (type) {
      // Receive message from SearchInput component
      case 'get-all-matches-msg':
        resetStore(store);
        const findValue: string = message.payload;
        executeContentScriptOnAllTabs(findValue, store);

        return;
      case 'next-match':
      case 'prev-match':
        // ***2
        if (sender.tab && sender.tab.id) {
          const response = await executeContentScriptWithMessage(
            sender.tab.id,
            message.type
          );

          const tabState = store.tabStates[sender.tab.id];

          if (response.status === 'success') {
            const currentIndex = response.serializedState2.currentIndex;

            updateStore(store, {
              globalMatchIdx: tabState.globalMatchIdxStart + currentIndex,
              tabStates: {
                ...store.tabStates,
                [sender.tab.id]: {
                  ...tabState,
                  currentIndex,
                },
              },
            });
          }
        }
        console.log(store);
        return;
      case 'remove-styles-all-tabs':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'remove-styles' });
            }
          });
        });

        updateStore(store, {
          showOverlay: false,
          showMatches: false,
        });

        console.log(store);
        return;
      case 'add-styles-all-tabs':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'add-styles' });
            }
          });
        });

        updateStore(store, {
          showOverlay: true,
          showMatches: true,
        });

        console.log(store);
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
        await switchTab(message.serializedState2);

        // TODO: NEED TO FIX THIS SO THAT STATE ISN'T UPDATED UNTIL AFTER THIS IS DONE. Currently it updates after next-match is finished and then updates again here, in switch-tab
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
  updateTotalTabsCount(store);
});

// chrome.tabs.onRemoved.addListener(updateTotalTabsCount);
chrome.tabs.onRemoved.addListener(() => {
  updateTotalTabsCount(store);
});

// TODO: KEEP, but fix errors
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  chrome.windows.get(windowId, (focusedWindow) => {
    if (chrome.runtime.lastError) {
      console.error(
        `checked runtime.lastError: ${chrome.runtime.lastError.message}`
      );
      return;
    }

    if (
      store.lastFocusedWindowId !== windowId &&
      focusedWindow.type === 'normal'
    ) {
      updateTotalTabsCount(store);
      store.updatedTabsCount = 0;
    }

    store.lastFocusedWindowId = windowId;
  });
});
