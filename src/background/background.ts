// src/background/background.ts

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
import { sendMessageToTab } from '../utils/messageUtils/sendMessageToContentScripts';
import { clearLocalStorage } from '../utils/storage';
import {
  initStore,
  resetPartialStore,
  sendStoreToContentScripts,
  updateStore,
} from './store';

let store: Store;

initStore().then((initializedStore) => {
  store = initializedStore;

  const lastFocusedWindowId = store?.lastFocusedWindowId;

  if (lastFocusedWindowId === undefined) {
    return;
  }

  // const activeWindowStore = getActiveWindowStore(); //FIXME: refactor/DRY as this is the same as the next line
  const lastFocusedWindowStore = store.windowStores[lastFocusedWindowId];
  // TODO: verify that `lastFocusedWindowStore` will never be undefined
  // if (lastFocusedWindowStore) {
  //   return;
  // }

  if (process.env.E2E_TESTING === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    updateStoreForTesting();
  }
  sendStoreToContentScripts(lastFocusedWindowStore);
});

function updateStoreForTesting() {
  Object.keys(store.windowStores).forEach((windowId) => {
    const windowStore = store.windowStores[windowId];

    updateStore(windowStore, {
      showLayover: true,
      showMatches: true,
    });
  });
}

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

    const { type, payload } = message;
    const activeWindowStore = getActiveWindowStore();

    if (!activeWindowStore) {
      console.error('No active window store available');
      return undefined;
    }

    switch (type) {
      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);

        sendStoreToContentScripts(activeWindowStore);
        return true;
      case 'get-all-matches': {
        const { searchValue } = payload;

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
  const activeWindowStore = getActiveWindowStore();
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

// TODO: Verify that you have feauter flags setup
// if (process.env.NODE_ENV !== 'production') {
//   window.toggleLayover = function () {
//     const activeWindowStore = getActiveWindowStore();
//     if (!activeWindowStore) {
//       console.error('No active window store available');
//       return;
//     }

//     const addStyles = !activeWindowStore.showLayover;

//     updateStore(activeWindowStore, {
//       showLayover: addStyles,
//       showMatches: addStyles,
//     });

//     sendStoreToContentScripts(activeWindowStore);
//   };
// }

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

chrome.action.onClicked.addListener(() => {
  const activeWindowStore = getActiveWindowStore();
  const addStyles = !activeWindowStore.showLayover;

  updateStore(activeWindowStore, {
    showLayover: addStyles,
    showMatches: addStyles,
  });

  sendStoreToContentScripts(activeWindowStore);
});
