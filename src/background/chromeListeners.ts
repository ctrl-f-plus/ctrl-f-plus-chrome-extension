// src/background/chromeListeners.ts
/* eslint-disable import/prefer-default-export */
import {} from '../types/Store.types';
import { Messages } from '../types/message.types';
import {
  executeContentScriptOnAllTabs,
  handleRemoveAllHighlightMatches,
  handleSwitchTab,
  handleUpdateTabStatesObj,
} from './backgroundUtils';
import { getActiveTabId } from './helpers/chromeAPI';
import { clearLocalStorage } from './storage';
import { sendStoreToContentScripts } from './store';
import store from './databaseStore';
import { WindowStore } from './windowStore';

function getActiveWindowStore(): WindowStore | undefined {
  const { lastFocusedWindowId } = store;
  if (lastFocusedWindowId !== undefined) {
    return store.windowStores[lastFocusedWindowId];
  }
  return undefined;
}

export function startListeners() {
  chrome.runtime.onInstalled.addListener(async () => {
    clearLocalStorage();
  });

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

          activeWindowStore.resetPartialStore();

          activeWindowStore.update({
            searchValue,
            lastSearchValue: searchValue,
          });

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
          await handleSwitchTab(
            activeWindowStore,
            payload.serializedState,
            payload.direction
          );
          // updateTabStore(activeWindowStore, payload.serializedState);
          // await switchToTargetTab(
          //   activeWindowStore,
          //   payload.serializedState,
          //   payload.direction
          // );
          // await sendStoreToContentScripts(activeWindowStore);
          // await updateActiveTabState(activeWindowStore, payload.direction);

          return true;
        }

        case 'remove-styles-all-tabs': // FIXME: Maybe rename to 'CLOSE_SEARCH_OVERLAY' - GETS CALLED WHEN CLOSING OVERLAY VIA `Escape` KEY
          activeWindowStore.setShowLayoverAndShowMatches(false);
          sendStoreToContentScripts(activeWindowStore);

          return true;

        case 'update-layover-position': // FIXME: MAYBE CONSOLIDATE INTO update-tab-states-obj?
          activeWindowStore.updateLayoverPosition(payload.newPosition);
          break;
        default:
          break;
      }
      return true;
    }
  );

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
        activeWindowStore.updateTotalTabsCount();
        activeWindowStore.updatedTabsCount = 0;

        sendStoreToContentScripts(activeWindowStore);
      }
    });
  });

  chrome.tabs.onCreated.addListener(() => {
    const activeWindowStore = getActiveWindowStore();
    if (!activeWindowStore) {
      console.error('No active window store available');
      return;
    }

    activeWindowStore.updateTotalTabsCount();

    sendStoreToContentScripts(activeWindowStore);
  });

  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const activeWindowStore = getActiveWindowStore();
    if (!activeWindowStore) {
      console.error('No active window store available');
      return;
    }

    activeWindowStore.setActiveTabId(tabId);

    // TODO: if showMatches then search the new tab and update everything? Otherwise, if you open a new tab, go back to the previously opened tab and search the same value again, it doesn't know to search the new tab because it uses nextMatch(). There are other solutions if you change your mind on this one.

    if (activeWindowStore.showLayover) {
      sendStoreToContentScripts(activeWindowStore);
    }
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

  chrome.tabs.onRemoved.addListener(() => {
    const activeWindowStore = getActiveWindowStore();
    if (!activeWindowStore) {
      console.error('No active window store available');
      return;
    }

    activeWindowStore.updateTotalTabsCount();

    sendStoreToContentScripts(activeWindowStore);
  });

  chrome.action.onClicked.addListener(() => {
    const activeWindowStore = getActiveWindowStore();
    const addStyles = !activeWindowStore.showLayover;

    activeWindowStore.setShowLayoverAndShowMatches(addStyles);

    sendStoreToContentScripts(activeWindowStore);
  });

  chrome.commands.onCommand.addListener(async (command) => {
    const activeWindowStore = getActiveWindowStore();
    if (!activeWindowStore) {
      console.error('No active window store available');
      return;
    }

    if (command === 'toggle_search_layover') {
      const addStyles = !activeWindowStore.showLayover;

      activeWindowStore.setShowLayoverAndShowMatches(addStyles);

      sendStoreToContentScripts(activeWindowStore);
    }
  });
}
