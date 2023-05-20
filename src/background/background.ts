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
      case 'get-all-matches-msg':
        const findValue = payload; //FIXME: refactor

        resetPartialStore(store);

        updateStore(store, {
          findValue,
          searchValue: findValue,
          lastSearchValue: findValue,
        });

        if (findValue === '') {
          sendStoreToContentScripts(store);
          return;
        }

        await executeContentScriptOnAllTabs(payload, store);
        sendStoreToContentScripts(store);

        return true;
      case 'remove-styles-all-tabs':
        updateStore(store, {
          showLayover: false,
          showMatches: false,
        });
        sendStoreToContentScripts(store);

        return true;
      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);
        sendStoreToContentScripts(store);

        break;
      case 'CLOSE_SEARCH_OVERLAY':
        updateStore(store, {
          showLayover: false,
          showMatches: false,
        });
        sendStoreToContentScripts(store);

        break;
      case 'switch-tab':
        await switchTab(message.serializedState);

        return true;
      case 'update-tab-states-obj':
        console.log('update-tab-states-obj');
        await handleUpdateTabStatesObj(payload, sendResponse);
        return true;
      case 'update-layover-position':
        await handleUpdateLayoverPosition(store, payload.newPosition);
        return;
      default:
        return;
    }
  }
);

// FIXME:
// - could maybe use sendMessageToContentScripts() instead, but need to message active tab first
// - Could maybe be improved by using the `active-tab` field in the store
// - This would be better if it only ran on stored tabs instead of using getOrderedTabs()
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  updateStore(store, { activeTabId: tabId });

  // TODO: if showMatches then search the new tab and update everything? Otherwise, if you open a new tab, go back to the previously opened tab and search the same value again, it doesn't know to search the new tab because it uses nextMatch(). There are other solutions if you change your mind on this one.

  if (store.showLayover) {
    sendStoreToContentScripts(store);
  }
});

// FIXME: MESSAGE TPYE?
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
      sendStoreToContentScripts(store);
    }

    store.lastFocusedWindowId = windowId;
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  // console.log(store);

  // resetStore(store);

  // const tabs: chrome.tabs.Tab[] = await new Promise((resolve) => {
  //   chrome.tabs.query({}, (tabs) => {
  //     resolve(tabs);
  //   });
  // });

  // const tabIds = tabs
  //   .map((tab) => tab.id)
  //   .filter((id): id is ValidTabId => id !== undefined);

  // sendStoreToContentScripts(store, tabIds);
  // // debugger;
  await clearLocalStorage();
});

// FIXME: REVIEW
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!store.showMatches) {
    return;
  }
  sendStoreToContentScripts(store);
});
