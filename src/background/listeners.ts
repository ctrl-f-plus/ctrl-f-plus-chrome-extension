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
export let csLoaded = false;

export default function startListeners() {
  chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    console.log('installed');
    console.log(reason);
    if (reason === 'install') {
      chrome.tabs.create({
        url: 'https://ctrl-f.plus/',
      });
    }

    clearLocalStorage();
  });

  chrome.runtime.onMessage.addListener(
    async (message: ToBackgroundMessage, sender, sendResponse) => {
      try {
        log('Received message:', message, ' \n Store: ', store);

        const { type, payload } = message;
        const { activeWindowStore } = store;
        if (typeof activeWindowStore === undefined) {
          console.error('activeWindowStore is undefined!');
        }

        switch (type) {
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
        console.log('caught error');
      }
    }
  );

  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    try {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        return;
      }

      if (store === undefined) {
        console.log('omg no store - onFocusChange');
        return;
      }

      store.setLastFocusedWindowId(windowId);

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        console.log('aint got no store - onFocusChange');
        return;
      }
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
      console.log(error);
    }
  });

  chrome.tabs.onCreated.addListener(() => {
    try {
      if (store === undefined) {
        console.log('omg no store - onCreated');
        return;
      }

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        console.log('aint got no store - onCreated');
        return;
      }
      activeWindowStore.setTotalTabsCount();

      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.log(error);
    }
  });

  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    try {
      if (store === undefined) {
        console.log('omg no store - onActivated');
        return;
      }

      const { activeWindowStore } = store;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        console.log('aint got no store - onActivated');
        return;
      }

      activeWindowStore.setActiveTabId(tabId);

      if (activeWindowStore.showLayover) {
        activeWindowStore.sendToContentScripts();
      }
    } catch (error) {
      console.log(error);
    }
  });

  chrome.tabs.onUpdated.addListener(async () => {
    try {
      if (store === undefined) {
        console.log('omg no store - onActivated');
        return;
      }

      const { activeWindowStore } = store;
      csLoaded = true;
      if (activeWindowStore === undefined) {
        store.activeWindowStore = createWindowStore();
        console.log('aint got no store');
        return;
      }

      if (!activeWindowStore.showMatches) {
        return;
      }

      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.log(error);
    }
  });

  chrome.tabs.onRemoved.addListener(() => {
    try {
      if (store === undefined) {
        console.log('omg no store - onActivated');
        return;
      }
      const { activeWindowStore } = store;
      activeWindowStore.setTotalTabsCount();

      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.log(error);
    }
  });

  chrome.action.onClicked.addListener(() => {
    try {
      if (store === undefined) {
        console.log('omg no store - onActivated');
        return;
      }
      const { activeWindowStore } = store;
      console.log(activeWindowStore);
      activeWindowStore.toggleShowFields();

      activeWindowStore.sendToContentScripts();
    } catch (error) {
      console.log('Caught chrome.action.onClicked.addListener Error');
    }
  });

  chrome.commands.onCommand.addListener(async (command) => {
    try {
      if (command === 'toggle_search_layover') {
        if (store === undefined) {
          console.log('omg no store - onActivated');
          return;
        }

        const { activeWindowStore } = store;
        if (activeWindowStore === undefined) {
          store.activeWindowStore = createWindowStore();
          console.log('aint got no store1');
          return;
        }

        console.log(activeWindowStore);
        activeWindowStore.toggleShowFields();

        // activeWindowStore.sendToContentScripts();
        // activeWindowStore.resetPartialStore();
        // activeWindowStore.update({
        //   searchValue: activeWindowStore.lastSearchValue,
        //   lastSearchValue: activeWindowStore.lastSearchValue,
        // });

        if (activeWindowStore.lastSearchValue === '') {
          activeWindowStore.sendToContentScripts();
          return;
        }
        await handleGetAllMatches();
        activeWindowStore.sendToContentScripts();
      }
    } catch (error) {
      console.log(error);
    }
  });
}
