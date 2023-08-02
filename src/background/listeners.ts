/* eslint-disable no-fallthrough */
// src/background/chromeListeners.ts

import {
  CONTENT_SCRIPT_INITIALIZED,
  GET_ALL_MATCHES,
  REMOVE_ALL_HIGHLIGHT_MATCHES,
  REMOVE_ALL_STYLES,
  SWITCH_TAB,
  ToBackgroundMessage,
  UPDATE_LAYOVER_POSITION,
  UPDATED_TAB_STATE,
} from '../contentScripts/types/toBackgroundMessage.types';
import log from '../shared/utils/logger';
import {
  handleGetAllMatches,
  handleRemoveAllHighlightMatches,
  handleSwitchTab,
  handleUpdateTabStates,
} from './messageHandlers';
import store from './store/databaseStore';
import { createWindowStore } from './store/windowStore';
import { getActiveTabId } from './utils/chromeApiUtils';
import { clearAllStoredTabs, clearLocalStorage } from './utils/storage';

// eslint-disable-next-line import/no-mutable-exports
// export let csLoaded = false;

function ensureActiveWindowStore() {
  const { activeWindowStore } = store;

  if (activeWindowStore === undefined) {
    store.activeWindowStore = createWindowStore();
  }

  return activeWindowStore;
}

function isStoreDefined() {
  if (store === undefined) {
    console.log('store undefined');
    return false;
  }

  return true;
}

// function errorHandler(
//   callback: (windowId: number) => Promise<void>
// ): (windowId: number) => Promise<void> {
//   return async (windowId: number) => {
//     try {
//       if (!isStoreDefined()) {
//         return;
//       }

//       await callback(windowId);
//     } catch (error) {
//       console.error(`Error occurred: ${error}`);
//     }
//   };
// }

export default function startListeners() {
  chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    // console.log('installed');
    console.log(`Installed Reason: `, reason);
    // if (reason === 'install') {
    chrome.tabs.create({
      url: 'https://ctrl-f-plus-website-git-final-design-dev-3a5ab2-bmchavez-s-team.vercel.app/',
    });
    // }
    clearLocalStorage();
  });

  chrome.runtime.onMessage.addListener(
    async (message: ToBackgroundMessage, sender, sendResponse) => {
      console.log('chrome.runtime.onMessage.addListener started');
      try {
        log('Received message:', message, ' \n Store: ', store);

        const { type, payload } = message;
        const activeWindowStore = ensureActiveWindowStore();

        switch (type) {
          case CONTENT_SCRIPT_INITIALIZED:
            if (!sender.tab?.id) {
              break;
            }
            // activeWindowStore.tabStores[sender.tab.id] = payload;

            activeWindowStore.addTabToTabStores(
              sender.tab.id,
              // payload.serializedState
              payload.serializedState
            );
            break;
          case UPDATED_TAB_STATE:
            ensureActiveWindowStore();
            await handleUpdateTabStates(payload, sendResponse);
            break;
          case REMOVE_ALL_HIGHLIGHT_MATCHES:
            await clearAllStoredTabs();
            await handleRemoveAllHighlightMatches(sendResponse);
            await activeWindowStore.sendToContentScripts();
            break;
          case GET_ALL_MATCHES:
            // return handleGetAllMatches(payload.searchValue);
            activeWindowStore.resetPartialStore();
            activeWindowStore.update({
              searchValue: payload.searchValue,
              lastSearchValue: payload.searchValue,
            });

            if (payload.searchValue === '') {
              activeWindowStore.sendToContentScripts();
              return undefined;
            }
            await handleGetAllMatches();
            activeWindowStore.sendToContentScripts();
            return true;
          case SWITCH_TAB:
            await handleSwitchTab(payload.serializedState, payload.direction);
            break;
          case REMOVE_ALL_STYLES: // FIXME: Maybe rename to 'CLOSE_SEARCH_OVERLAY' - GETS CALLED WHEN CLOSING OVERLAY VIA `Escape` KEY
            activeWindowStore.toggleShowFields(false);
            activeWindowStore.sendToContentScripts();
            break;
          case UPDATE_LAYOVER_POSITION: // FIXME: MAYBE CONSOLIDATE INTO update-tab-states-obj?
            activeWindowStore.updateLayoverPosition(payload.newPosition);
            break;
          default:
            break;
        }

        return true;
      } catch (error) {
        console.log('caught error: ', error);
      }
    }
  );

  chrome.windows.onFocusChanged.addListener(
    // errorHandler(
    async (windowId: number) => {
      try {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
          return;
        }

        if (!isStoreDefined()) {
          return;
        }

        store.setLastFocusedWindowId(windowId);

        const activeWindowStore = ensureActiveWindowStore();

        const activeTabId = await getActiveTabId();
        activeWindowStore.setActiveTabId(activeTabId);
        activeWindowStore.sendToContentScripts();

        chrome.windows.get(windowId, (focusedWindow) => {
          if (focusedWindow.type === 'normal') {
            activeWindowStore.setTotalTabsCount();
            activeWindowStore.setUpdatedTabsCount(0);
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
    // )
  );

  chrome.tabs.onCreated.addListener(() => {
    try {
      if (!isStoreDefined()) {
        return;
      }

      const activeWindowStore = ensureActiveWindowStore();
      activeWindowStore.setTotalTabsCount();
      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.error(error);
    }
  });

  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    try {
      if (!isStoreDefined()) {
        return;
      }

      const activeWindowStore = ensureActiveWindowStore();
      activeWindowStore.setActiveTabId(tabId);

      if (activeWindowStore.showLayover) {
        activeWindowStore.sendToContentScripts();
      }
    } catch (error) {
      console.error(error);
    }
  });

  chrome.tabs.onUpdated.addListener(async () => {
    try {
      if (!isStoreDefined()) {
        return;
      }

      const activeWindowStore = ensureActiveWindowStore();

      if (!activeWindowStore.showMatches) {
        return;
      }

      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.error(error);
    }
  });

  chrome.tabs.onRemoved.addListener(() => {
    try {
      if (!isStoreDefined()) {
        return;
      }

      const activeWindowStore = ensureActiveWindowStore();
      activeWindowStore.setTotalTabsCount();
      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.error(error);
    }
  });

  chrome.action.onClicked.addListener(() => {
    try {
      if (!isStoreDefined()) {
        return;
      }

      // const { activeWindowStore } = store;
      const activeWindowStore = ensureActiveWindowStore();
      activeWindowStore.toggleShowFields();

      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.error(error);
    }
  });

  chrome.commands.onCommand.addListener(async (command) => {
    try {
      if (command === 'toggle_search_layover') {
        if (!isStoreDefined()) {
          return;
        }

        const activeWindowStore = ensureActiveWindowStore();
        activeWindowStore.toggleShowFields();
        activeWindowStore.sendToContentScripts();
      }
    } catch (error) {
      console.error(error);
    }
  });
}
