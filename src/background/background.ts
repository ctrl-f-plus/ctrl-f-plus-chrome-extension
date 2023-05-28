// src/background/background.ts
// @ts-nocheck

import { Store, WindowStore } from '../types/Store.types';
import { Messages, UpdateHighlightsMsg } from '../types/message.types';
import { ValidTabId } from '../types/tab.types';
import {
  executeContentScriptOnAllTabs,
  getActiveTabId,
  handleRemoveAllHighlightMatches,
  handleUpdateLayoverPosition,
  handleUpdateTabStatesObj,
  switchTab,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
// import { createUpdateHighlightsMsg } from '../utils/messageUtils/createMessages';
import { sendMessageToTab } from '../utils/messageUtils/sendMessageToContentScripts';
import { clearLocalStorage } from '../utils/storage';
import {
  initStore,
  resetPartialStore,
  sendStoreToContentScripts,
  updateStore,
} from './store';

let store: Store;
console.log('background script running');

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

function getActiveWindowStore(): WindowStore | undefined {
  const { lastFocusedWindowId } = store;
  if (lastFocusedWindowId !== undefined) {
    return store.windowStores[lastFocusedWindowId];
  }
  return undefined;
}

function updateAndSendActiveWindowStore(update: Partial<WindowStore>) {
  const activeWindowStore = getActiveWindowStore();
  if (activeWindowStore) {
    Object.assign(activeWindowStore, update);
    sendStoreToContentScripts(activeWindowStore);
  }
}

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    if (!store) {
      console.error('Store is not yet initialized');
      return undefined;
    }

    console.log('Received message:', message, ' \n Store: ', store);

    const {
      type,
      payload,
      // transactionId
    } = message;
    const activeWindowStore = getActiveWindowStore();

    if (!activeWindowStore) {
      console.error('No active window store available');
      return undefined;
    }

    switch (type) {
      case 'create-popup':
        // if (message && message.payload) {
        //   chrome.windows.create({
        //     url: chrome.runtime.getURL('popup.html'), // replace "popup.html" with your popup HTML file
        //     type: 'popup',
        //     top: message.payload.top,
        //     left: message.payload.left,
        //     width: 400,
        //     height: 600,
        //   });
        // }
        return true;

      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);

        sendStoreToContentScripts(activeWindowStore);
        return true;
      case 'get-all-matches': {
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
          sendStoreToContentScripts(activeWindowStore);
          return undefined;
        }

        await executeContentScriptOnAllTabs(activeWindowStore);

        sendStoreToContentScripts(activeWindowStore);

        return true;
      }
      case 'update-tab-states-obj':
        await handleUpdateTabStatesObj(
          activeWindowStore,
          payload,
          sendResponse
        );
        return true;
      case 'switch-tab': {
        await switchTab(
          activeWindowStore,
          payload.serializedState,
          payload.direction
        );
        const activeTabId = (await getActiveTabId()) as unknown as ValidTabId;

        await sendStoreToContentScripts(activeWindowStore);

        const { newSerializedState } =
          await sendMessageToTab<UpdateHighlightsMsg>(activeTabId, {
            async: true,
            from: 'background',
            type: 'update-highlights',
            payload: {
              tabId: activeTabId,
              direction: payload.direction,
            },
          });
        if (activeWindowStore) {
          // Object.assign(activeWindowStore);
          activeWindowStore.tabStores[activeTabId].serializedTabState =
            newSerializedState;
        }
        return true;
      }
      case 'remove-styles-all-tabs': // FIXME: Maybe rename to 'CLOSE_SEARCH_OVERLAY' - GETS CALLED WHEN CLOSING OVERLAY VIA `Escape` KEY
        // updateStore(store, {
        //   showLayover: false,
        //   showMatches: false,
        // });
        // sendStoreToContentScripts(store);

        updateAndSendActiveWindowStore({
          showLayover: false,
          showMatches: false,
        });

        return true;

      case 'update-layover-position': // FIXME: MAYBE CONSOLIDATE INTO update-tab-states-obj?
        await handleUpdateLayoverPosition(
          activeWindowStore,
          payload.newPosition
        );
        break;
      case 'pop-up-init': {
        const activeWindowStore = getActiveWindowStore();

        if (!activeWindowStore) {
          console.error('No active window store available');
          debugger;
          return;
        }

        // if (command === 'toggle_search_layover') {
        const addStyles = !activeWindowStore.showLayover;

        updateStore(activeWindowStore, {
          showLayover: addStyles,
          showMatches: addStyles,
        });

        sendStoreToContentScripts(activeWindowStore);
        // }
        return false;
      }
      default:
        break;
    }
    return true;
  }
);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const activeWindowStore = getActiveWindowStore();
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  updateStore(activeWindowStore, { activeTabId: tabId });

  // TODO: if showMatches then search the new tab and update everything? Otherwise, if you open a new tab, go back to the previously opened tab and search the same value again, it doesn't know to search the new tab because it uses nextMatch(). There are other solutions if you change your mind on this one.

  if (activeWindowStore.showLayover) {
    sendStoreToContentScripts(activeWindowStore);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === '_execute_action') {
    console.log('background');
    debugger;
  }

  debugger;
  const activeWindowStore = getActiveWindowStore();
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  debugger;
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
  const activeWindowStore = getActiveWindowStore();
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  updateTotalTabsCount(activeWindowStore);

  sendStoreToContentScripts(activeWindowStore);
});

chrome.tabs.onRemoved.addListener(() => {
  const activeWindowStore = getActiveWindowStore();
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  updateTotalTabsCount(activeWindowStore);

  sendStoreToContentScripts(activeWindowStore);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const activeTabId = await getActiveTabId();
  store.lastFocusedWindowId = windowId;

  const activeWindowStore = getActiveWindowStore();
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  activeWindowStore.activeTabId = activeTabId;

  chrome.windows.get(windowId, (focusedWindow) => {
    if (focusedWindow.type === 'normal') {
      updateTotalTabsCount(activeWindowStore);
      activeWindowStore.updatedTabsCount = 0;

      sendStoreToContentScripts(activeWindowStore);
    }
  });
});

chrome.runtime.onInstalled.addListener(async () => {
  clearLocalStorage();
});

chrome.tabs.onUpdated.addListener(async () => {
  const activeWindowStore = getActiveWindowStore();
  if (!activeWindowStore) {
    console.error('No active window store available');
    return;
  }

  if (!activeWindowStore.showMatches) {
    return;
  }

  sendStoreToContentScripts(activeWindowStore);
});

function contentScriptFunc(name) {
  alert(`"${name}" executed`);
}

// This callback WILL NOT be called for "_execute_action"
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" called`);
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: contentScriptFunc,
    args: ['action'],
  });
});
