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
  handleUpdateTabStatesObj,
  sendTabMessage,
  switchTab,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
import { clearLocalStorage } from '../utils/storage';
import { initStore } from './store';

export const store = initStore();

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    const { type, payload } = message;

    switch (type) {
      case 'get-all-matches-msg':
        await handleGetAllMatchesMsg(payload);
        return;
      case 'next-match':
      case 'prev-match':
        await handleNextPrevMatch(sender, type);
        return;
      case 'remove-styles-all-tabs':
        await handleToggleStylesAllTabs(false);
        return;
      case 'add-styles-all-tabs':
        await handleToggleStylesAllTabs(true);
        return;
      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);
        break;
      case 'switch-tab':
        await switchTab(message.serializedState2);

        // TODO: NEED TO FIX THIS SO THAT STATE ISN'T UPDATED UNTIL AFTER THIS IS DONE. Currently it updates after next-match is finished and then updates again here, in switch-tab
        return;
      case 'update-tab-states-obj':
        await handleUpdateTabStatesObj(payload, sendResponse);
        return;
      default:
        break;
    }
  }
);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // TODO:(***101):This would be better if it only ran on stored tabs
  // const storedTabs = await getAllStoredTabs();
  // const matchesObject = storedTabs;
  // const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));

  // const orderedTabs = arrangeTabs(tabs, tabId);
  // const orderedTabIds = arrangeTabs(tabIds, tabId);
  // TODO:(***101): Here
  const orderedTabs = await getOrderedTabs();

  const message1: SwitchedActiveTabShowLayover = {
    // TODO:reset currentIndex so that when you hit next on the new tab it highlights the first match on that page
    from: 'background',
    type: 'switched-active-tab-show-layover',
  };

  sendTabMessage(tabId, message1);

  const inactiveTabs = orderedTabs.filter((tab) => tab.id !== tabId);

  for (const otherTab of inactiveTabs) {
    if (otherTab.id) {
      const message2: SwitchedActiveTabHideLayover = {
        from: 'background',
        type: 'switched-active-tab-hide-layover',
      };
      sendTabMessage(otherTab.id, message2);
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  // TODO:REVIEW `active:currentWindow: true` below:
  // chrome.tabs.query({}, (tabs) => {
  if (command === 'toggle_search_layover') {
    // chrome.tabs.query({ active:currentWindow: true }, (tabs) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        sendTabMessage(tabs[0].id, { command });
      }
    });
  }
});

// chrome.tabs.onCreated.addListener(updateTotalTabsCount);
chrome.tabs.onCreated.addListener(() => {
  updateTotalTabsCount(store);
});

// chrome.tabs.onRemoved.addListener(updateTotalTabsCount);
chrome.tabs.onRemoved.addListener(() => {
  updateTotalTabsCount(store);
});

// TODO: KEEP, but fix errors
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
    }

    store.lastFocusedWindowId = windowId;
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  await clearLocalStorage();
});
