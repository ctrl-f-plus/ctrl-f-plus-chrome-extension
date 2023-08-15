// src/background/chromeListeners.ts

import {
  GET_ALL_MATCHES,
  REMOVE_ALL_HIGHLIGHT_MATCHES,
  REMOVE_ALL_STYLES,
  SWITCH_TAB,
  ToBackgroundMessage,
  UPDATE_LAYOVER_POSITION,
  UPDATED_TAB_STATE,
} from '../contentScripts/types/toBackgroundMessage.types';
import ctrlLogger from '../shared/utils/ctrlLogger';
import {
  handleGetAllMatches,
  handleRemoveAllHighlightMatches,
  handleSwitchTab,
  handleUpdateTabStates,
} from './messageHandlers';
import store from './store/databaseStore';
import InstallDetails from './store/installDetails';
import { createWindowStore } from './store/windowStore';
import { getActiveTabId, queryAllTabIds } from './utils/chromeApiUtils';
import { clearAllStoredTabs, clearLocalStorage } from './utils/storage';

// eslint-disable-next-line import/no-mutable-exports
export let csLoaded = false;

async function executeContentScript() {
  const tabIds = await queryAllTabIds();

  tabIds.forEach(async (tabId) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['layover.js', 'highlightStyles.js'],
      });
    } catch (error) {
      ctrlLogger.warn(`Caught `, error);
    }
  });
}

async function checkOnInstalled() {
  setTimeout(async () => {
    if (InstallDetails != null) {
      await executeContentScript();
      // if (InstallDetails.reason === 'install') {
      //   // BrowserApi.createNewTab('https://bitwarden.com/browser-start/');

      //   await executeContentScript();
      // }

      InstallDetails.reason = null;
    }
  }, 100);
}

export function startOnInstalledListener() {
  chrome.runtime.onInstalled.addListener((details) => {
    clearLocalStorage();
    InstallDetails.reason = details.reason;
  });
}

export default async function startListeners() {
  await checkOnInstalled();

  chrome.runtime.onMessage.addListener(
    async (message: ToBackgroundMessage, sender, sendResponse) => {
      try {
        ctrlLogger.info('Received message:', message, ' \n Store: ', store);

        const { type, payload } = message;
        const { activeWindowStore } = store;
        if (typeof activeWindowStore === undefined) {
          ctrlLogger.error('activeWindowStore is undefined!');
        }

        switch (type) {
          case REMOVE_ALL_HIGHLIGHT_MATCHES:
            activeWindowStore.resetPartialStore();

            activeWindowStore.sendToContentScripts({
              restoreHighlights: false,
            });

            await clearAllStoredTabs();
            await handleRemoveAllHighlightMatches(sendResponse);
            // handleRemoveAllHighlightMatches(sendResponse);

            break;
          case GET_ALL_MATCHES:
            // return handleGetAllMatches(payload.searchValue);
            // activeWindowStore.resetPartialStore();
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
          case UPDATED_TAB_STATE:
            await handleUpdateTabStates(payload, sendResponse);
            break;
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
        ctrlLogger.log('caught error: ', error);
        return false;
      }
    }
  );

  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    try {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        return;
      }

      if (store === undefined) {
        return;
      }

      store.setLastFocusedWindowId(windowId);

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        return;
      }
      const activeTabId = await getActiveTabId();
      activeWindowStore.setActiveTabId(activeTabId);

      activeWindowStore.sendToContentScripts({ restoreHighlights: false });

      chrome.windows.get(windowId, (focusedWindow) => {
        if (focusedWindow.type === 'normal') {
          activeWindowStore.setTotalTabsCount();
          activeWindowStore.setUpdatedTabsCount(0);
        }
      });
    } catch (error) {
      ctrlLogger.log(error);
    }
  });

  // TODO:***
  chrome.tabs.onCreated.addListener(() => {
    try {
      if (store === undefined) {
        return;
      }

      // ctrlLogger.log('store: ', store);

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        return;
      }
      activeWindowStore.setTotalTabsCount();
      activeWindowStore.lastSearchValue = '';

      activeWindowStore.sendToContentScripts({ restoreHighlights: false });
    } catch (error) {
      ctrlLogger.log(error);
    }
  });

  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    try {
      if (store === undefined) {
        return;
      }

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        return;
      }

      activeWindowStore.setActiveTabId(tabId);

      if (activeWindowStore.showLayover) {
        activeWindowStore.sendToContentScripts();
      }
    } catch (error) {
      ctrlLogger.log(error);
    }
  });

  chrome.tabs.onUpdated.addListener(async () => {
    try {
      if (store === undefined) {
        return;
      }

      const { activeWindowStore } = store;
      csLoaded = true;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        return;
      }

      if (!activeWindowStore.showMatches) {
        return;
      }

      activeWindowStore.sendToContentScripts({ restoreHighlights: false });
    } catch (error) {
      ctrlLogger.log(error);
    }
  });

  chrome.tabs.onRemoved.addListener((removedTabId: any) => {
    try {
      if (store === undefined) {
        return;
      }
      const { activeWindowStore } = store;
      activeWindowStore.setTotalTabsCount();
      activeWindowStore.removeTabStore(removedTabId);

      activeWindowStore.sendToContentScripts({ restoreHighlights: false });
    } catch (error) {
      ctrlLogger.log(error);
    }
  });

  chrome.action.onClicked.addListener(() => {
    try {
      // await executeContentScript();
      if (store === undefined) {
        return;
      }

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        return;
      }
      activeWindowStore.toggleShowFields();

      activeWindowStore.sendToContentScripts();
    } catch (error) {
      ctrlLogger.log('Caught chrome.action.onClicked.addListener ', Error);
    }
  });
}
