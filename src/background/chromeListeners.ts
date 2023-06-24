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

export function startListeners() {
  chrome.runtime.onInstalled.addListener(async () => {
    clearLocalStorage();
  });

  chrome.runtime.onMessage.addListener(
    async (message: Messages, sender, sendResponse) => {
      console.log('Received message:', message, ' \n Store: ', store);

      const { type, payload } = message;
      const { activeWindowStore } = store;

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

          await executeContentScriptOnAllTabs();

          sendStoreToContentScripts(activeWindowStore);

          return true;
        }
        case 'update-tab-states-obj':
          await handleUpdateTabStatesObj(payload, sendResponse);
          return true;

        case 'switch-tab': {
          await handleSwitchTab(payload.serializedState, payload.direction);
          return true;
        }

        case 'remove-styles-all-tabs': // FIXME: Maybe rename to 'CLOSE_SEARCH_OVERLAY' - GETS CALLED WHEN CLOSING OVERLAY VIA `Escape` KEY
          activeWindowStore.toggleShowFields(false);
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

    store.setLastFocusedWindowId(windowId);

    const { activeWindowStore } = store;
    const activeTabId = await getActiveTabId();
    activeWindowStore.setActiveTabId(activeTabId);

    chrome.windows.get(windowId, (focusedWindow) => {
      if (focusedWindow.type === 'normal') {
        activeWindowStore.setTotalTabsCount();
        activeWindowStore.setUpdatedTabsCount(0);

        sendStoreToContentScripts(activeWindowStore);
      }
    });
  });

  chrome.tabs.onCreated.addListener(() => {
    const { activeWindowStore } = store;
    activeWindowStore.setTotalTabsCount();

    sendStoreToContentScripts(activeWindowStore);
  });

  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const { activeWindowStore } = store;
    activeWindowStore.setActiveTabId(tabId);

    // TODO: if showMatches then search the new tab and update everything? Otherwise, if you open a new tab, go back to the previously opened tab and search the same value again, it doesn't know to search the new tab because it uses nextMatch(). There are other solutions if you change your mind on this one.

    if (activeWindowStore.showLayover) {
      sendStoreToContentScripts(activeWindowStore);
    }
  });

  chrome.tabs.onUpdated.addListener(async () => {
    const { activeWindowStore } = store;

    if (!activeWindowStore.showMatches) {
      return;
    }

    sendStoreToContentScripts(activeWindowStore);
  });

  chrome.tabs.onRemoved.addListener(() => {
    const { activeWindowStore } = store;
    activeWindowStore.setTotalTabsCount();

    sendStoreToContentScripts(activeWindowStore);
  });

  chrome.action.onClicked.addListener(() => {
    const { activeWindowStore } = store;
    activeWindowStore.toggleShowFields();

    sendStoreToContentScripts(activeWindowStore);
  });

  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle_search_layover') {
      const { activeWindowStore } = store;
      activeWindowStore.toggleShowFields();

      sendStoreToContentScripts(activeWindowStore);
    }
  });
}
