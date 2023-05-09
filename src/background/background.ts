// src/background/background.ts

import {
  Messages,
  SwitchedActiveTabHideLayover,
  SwitchedActiveTabShowLayover,
} from '../types/message.types';
import {
  getOrderedTabs,
  handleGetAllMatchesMsg,
  handleNextPrevMatch,
  handleRemoveAllHighlightMatches,
  handleToggleStylesAllTabs,
  handleUpdateLayoverPosition,
  handleUpdateTabStatesObj,
  switchTab,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
import { sendMessageToTab } from '../utils/messageUtils/sendMessageToContentScripts';
import { clearLocalStorage } from '../utils/storage';
import { initStore, sendStoreToContentScripts } from './store';

export const store = initStore();
sendStoreToContentScripts(store);

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    const { type, payload } = message;

    switch (type) {
      case 'get-all-matches-msg':
        await handleGetAllMatchesMsg(payload);
        return true;
      case 'next-match':
      case 'prev-match':
        await handleNextPrevMatch(sender, type);
        return true;
      case 'remove-styles-all-tabs':
        await handleToggleStylesAllTabs(false);
        return true;
      case 'add-styles-all-tabs':
        await handleToggleStylesAllTabs(true);
        return true;
      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);
        break;
      case 'switch-tab':
        await switchTab(message.serializedState2);
        return true;
      case 'update-tab-states-obj':
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
  const orderedTabs = await getOrderedTabs();

  const msg: SwitchedActiveTabShowLayover = {
    from: 'background',
    type: 'switched-active-tab-show-layover',
  };

  sendMessageToTab(tabId, msg);

  const inactiveTabs = orderedTabs.filter((tab) => tab.id !== tabId);

  const msg2: SwitchedActiveTabHideLayover = {
    from: 'background',
    type: 'switched-active-tab-hide-layover',
  };

  for (const otherTab of inactiveTabs) {
    if (otherTab.id) {
      sendMessageToTab(otherTab.id, msg2);
    }
  }

  sendStoreToContentScripts(store);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_search_layover') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        sendMessageToTab(tabs[0].id, { command });
      }
    });
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

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

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
  await clearLocalStorage();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  sendStoreToContentScripts(store);
});
