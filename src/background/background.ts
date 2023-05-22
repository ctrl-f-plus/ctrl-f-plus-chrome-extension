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
  Store,
  WindowStore,
  initStore,
  resetPartialStore,
  sendStoreToContentScripts,
  updateStore,
} from './store';

let store: Store;

initStore().then((initializedStore) => {
  store = initializedStore;

  const lastFocusedWindowId = store?.lastFocusedWindowId;
  if (lastFocusedWindowId !== undefined) {
    const lastFocusedWindowStore = store.windowStores[lastFocusedWindowId];
    if (lastFocusedWindowStore) {
      sendStoreToContentScripts(lastFocusedWindowStore);
    }
  }
});

function getActiveWindowStore(store: Store): WindowStore | undefined {
  const { lastFocusedWindowId } = store;
  if (lastFocusedWindowId !== undefined) {
    return store.windowStores[lastFocusedWindowId];
  }
  return undefined;
}

function updateAndSendActiveWindowStore(
  store: Store,
  update: Partial<WindowStore>
) {
  const activeWindowStore = getActiveWindowStore(store);
  if (activeWindowStore) {
    Object.assign(activeWindowStore, update);
    sendStoreToContentScripts(activeWindowStore);
  }
}

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    if (!store) {
      console.error('Store is not yet initialized');
      return;
    }

    console.log('Received message:', message, ' \n Store: ', store);

    const { type, payload, transactionId } = message;
    const activeWindowStore = getActiveWindowStore(store);

    if (!activeWindowStore) {
      console.error('No active window store available');
      return;
    }

    switch (type) {
      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);
        debugger;
        sendStoreToContentScripts(activeWindowStore);
        return true;
      case 'get-all-matches':
        const { searchValue } = payload;

        // resetPartialStore(activeWindowStore);
        resetPartialStore(activeWindowStore);

        updateStore(activeWindowStore, {
          searchValue,
          lastSearchValue: searchValue,
        });

        // updateAndSendActiveWindowStore(store, {
        //   searchValue,
        //   lastSearchValue: searchValue,
        // });

        if (searchValue === '') {
          debugger;
          sendStoreToContentScripts(activeWindowStore);
          return;
        }

        await executeContentScriptOnAllTabs(activeWindowStore);
        debugger;
        sendStoreToContentScripts(activeWindowStore);

        return true;
      case 'update-tab-states-obj':
        await handleUpdateTabStatesObj(
          activeWindowStore,
          payload,
          sendResponse
        );
        return true;
      case 'switch-tab':
        await switchTab(
          activeWindowStore,
          payload.serializedState,
          payload.direction
        );
        return true;
      case 'remove-styles-all-tabs': // FIXME: Maybe rename to 'CLOSE_SEARCH_OVERLAY' - GETS CALLED WHEN CLOSING OVERLAY VIA `Escape` KEY
        // updateStore(store, {
        //   showLayover: false,
        //   showMatches: false,
        // });
        // sendStoreToContentScripts(store);
        debugger;
        updateAndSendActiveWindowStore(store, {
          showLayover: false,
          showMatches: false,
        });

        return true;

      case 'update-layover-position': // FIXME: MAYBE CONSOLIDATE INTO update-tab-states-obj?
        await handleUpdateLayoverPosition(
          activeWindowStore,
          payload.newPosition
        );
        return;
      default:
        return;
    }
  }
);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const activeWindowStore = getActiveWindowStore(store);
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  updateStore(activeWindowStore, { activeTabId: tabId });

  // TODO: if showMatches then search the new tab and update everything? Otherwise, if you open a new tab, go back to the previously opened tab and search the same value again, it doesn't know to search the new tab because it uses nextMatch(). There are other solutions if you change your mind on this one.

  console.log('activeWindowStore:: ', activeWindowStore);
  if (activeWindowStore.showLayover) {
    debugger;
    sendStoreToContentScripts(activeWindowStore);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const activeWindowStore = getActiveWindowStore(store);
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  if (command === 'toggle_search_layover') {
    const addStyles = !activeWindowStore.showLayover;

    updateStore(activeWindowStore, {
      showLayover: addStyles,
      showMatches: addStyles,
    });

    sendStoreToContentScripts(activeWindowStore);
  }
});

chrome.tabs.onCreated.addListener(() => {
  const activeWindowStore = getActiveWindowStore(store);
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  updateTotalTabsCount(activeWindowStore);
  debugger;
  sendStoreToContentScripts(activeWindowStore);
});

chrome.tabs.onRemoved.addListener(() => {
  const activeWindowStore = getActiveWindowStore(store);
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  updateTotalTabsCount(activeWindowStore);
  debugger;
  sendStoreToContentScripts(activeWindowStore);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const activeTabId = await getActiveTabId();
  store.lastFocusedWindowId = windowId;

  const activeWindowStore = getActiveWindowStore(store);
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  activeWindowStore.activeTabId = activeTabId;

  chrome.windows.get(windowId, (focusedWindow) => {
    if (focusedWindow.type === 'normal') {
      updateTotalTabsCount(activeWindowStore);
      activeWindowStore.updatedTabsCount = 0;
      // debugger;
      sendStoreToContentScripts(activeWindowStore);
    }
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  clearLocalStorage();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const activeWindowStore = getActiveWindowStore(store);
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  if (!activeWindowStore.showMatches) {
    return;
  }
  debugger;
  sendStoreToContentScripts(activeWindowStore);
});
