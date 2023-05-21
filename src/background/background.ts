// src/background/background.ts

import { Messages } from '../types/message.types';
import {
  executeContentScriptOnAllTabs,
  getActiveTabId,
  handleRemoveAllHighlightMatches,
  handleUpdateLayoverPosition,
  handleUpdateTabStatesObj,
  switchTab,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
import { clearLocalStorage } from '../utils/storage';
import {
  initStore,
  resetPartialStore,
  sendStoreToContentScripts,
  updateStore,
} from './store';

export const store = initStore();
sendStoreToContentScripts(store);

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    console.log('Received message:', message, ' \n Store: ', store);

    const { type, payload, transactionId } = message;

    switch (type) {
      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);
        sendStoreToContentScripts(store);

        break;
      case 'get-all-matches':
        const { searchValue } = payload;

        resetPartialStore(store);

        updateStore(store, {
          searchValue,
          lastSearchValue: searchValue,
        });

        if (searchValue === '') {
          sendStoreToContentScripts(store);
          return;
        }

        await executeContentScriptOnAllTabs(store);
        sendStoreToContentScripts(store);

        return true;
      case 'update-tab-states-obj':
        await handleUpdateTabStatesObj(payload, sendResponse);
        return true;
      case 'switch-tab':
        await switchTab(payload.serializedState);

        return true;
      case 'remove-styles-all-tabs': // FIXME: Maybe rename to 'CLOSE_SEARCH_OVERLAY' - GETS CALLED WHEN CLOSING OVERLAY VIA `Escape` KEY
        updateStore(store, {
          showLayover: false,
          showMatches: false,
        });
        sendStoreToContentScripts(store);

        return true;

      case 'update-layover-position': // FIXME: MAYBE CONSOLIDATE INTO update-tab-states-obj?
        console.log('update-layover-position');
        await handleUpdateLayoverPosition(store, payload.newPosition);
        return;
      default:
        return;
    }
  }
);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  updateStore(store, { activeTabId: tabId });

  // TODO: if showMatches then search the new tab and update everything? Otherwise, if you open a new tab, go back to the previously opened tab and search the same value again, it doesn't know to search the new tab because it uses nextMatch(). There are other solutions if you change your mind on this one.

  if (store.showLayover) {
    sendStoreToContentScripts(store);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_search_layover') {
    const addStyles = !store.showLayover;

    updateStore(store, {
      showLayover: addStyles,
      showMatches: addStyles,
    });

    sendStoreToContentScripts(store);
  }
});

chrome.tabs.onCreated.addListener(() => {
  updateTotalTabsCount(store);
  sendStoreToContentScripts(store);
});

chrome.tabs.onRemoved.addListener(() => {
  updateTotalTabsCount(store);
  sendStoreToContentScripts(store);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const activeTabId = await getActiveTabId();
  store.activeTabId = activeTabId;

  chrome.windows.get(windowId, (focusedWindow) => {
    if (
      store.lastFocusedWindowId !== windowId &&
      focusedWindow.type === 'normal'
    ) {
      updateTotalTabsCount(store);
      store.updatedTabsCount = 0;
      sendStoreToContentScripts(store);
    }

    store.lastFocusedWindowId = windowId;
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  clearLocalStorage();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!store.showMatches) {
    return;
  }
  sendStoreToContentScripts(store);
});
