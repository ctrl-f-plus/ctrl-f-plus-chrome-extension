// src/background/chromeListeners.ts
// src/background/listeners.ts

import browser from 'webextension-polyfill';
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
import { checkOnInstalled, getActiveTabId } from './utils/chromeApiUtils';
import { clearAllStoredTabs, clearLocalStorage } from './utils/storage';
import { ValidTabId } from '@src/contentScripts/types/tab.types';

// eslint-disable-next-line import/no-mutable-exports
export let csLoaded = false;

export function startOnInstalledListener() {
  browser.runtime.onInstalled.addListener((details) => {
    clearLocalStorage();
    InstallDetails.reason = details.reason;

    browser.contextMenus.create({
      id: 'KEYBOARD_SHORTCUT_SETUP',
      title: 'Set Keyboard Shortcut',
      contexts: ['action'],
    });

    browser.contextMenus.create({
      id: 'GITHUB',
      title: 'Open Source: View on GitHub',
      contexts: ['action'],
    });

    browser.contextMenus.create({
      id: 'DONATE',
      title: 'Donate',
      contexts: ['action'],
    });
  });
}

export async function startListeners() {
  await checkOnInstalled();

  browser.runtime.onMessage.addListener(
    (request: { popupMounted: boolean }) => {
      if (request.popupMounted) {
        console.log('background page notified that Popup.tsx has mounted');
      }
    }
  );

  browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case 'DONATE':
        browser.tabs.create({
          url: 'https://opencollective.com/ctrl-f-plus-chrome-extension',
        });
        break;
      case 'KEYBOARD_SHORTCUT_SETUP':
        browser.tabs.create({ url: 'chrome://extensions/shortcuts' });
        break;
      case 'GITHUB':
        browser.tabs.create({
          url: 'https://github.com/ctrl-f-plus/ctrl-f-plus-chrome-extension',
        });
        break;
      default:
    }
  });

  browser.runtime.onMessage.addListener(
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

            break;
          case GET_ALL_MATCHES:
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

  browser.windows.onFocusChanged.addListener(async (windowId) => {
    try {
      if (windowId === browser.windows.WINDOW_ID_NONE || store === undefined) {
        return;
      }

      store.setLastFocusedWindowId(windowId);

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        return;
      }

      try {
        const activeTabId = await getActiveTabId();
        activeWindowStore.setActiveTabId(activeTabId);
      } catch (error) {
        ctrlLogger.log('Error getting active tab ID:', error);
      }

      activeWindowStore.sendToContentScripts({ restoreHighlights: false });

      const focusedWindow = await browser.windows.get(windowId);

      // browser.windows.get(windowId, (focusedWindow) => {
      if (focusedWindow.type === 'normal') {
        activeWindowStore.setTotalTabsCount();
        activeWindowStore.setUpdatedTabsCount(0);
      }
      // });
    } catch (error) {
      ctrlLogger.log(error);
      // ctrlLogger.log('Error in onFocusChanged listener:', error);
    }
  });

  browser.tabs.onCreated.addListener(() => {
    try {
      if (store === undefined) {
        return;
      }

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

  // TODO: not sure if you need async here or not
  browser.tabs.onActivated.addListener(async ({ tabId }) => {
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

  browser.tabs.onUpdated.addListener(async () => {
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

  browser.tabs.onRemoved.addListener((removedTabId: ValidTabId) => {
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

  browser.action.onClicked.addListener(() => {
    try {
      // await executeContentScripts();
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
      ctrlLogger.log('Caught browser.action.onClicked.addListener ', Error);
    }
  });
}
