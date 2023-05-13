// src/background/background.ts

import {
  Messages,
  SwitchedActiveTabHideLayover,
  SwitchedActiveTabShowLayover,
  ToggleSearchLayoverMsg,
} from '../types/message.types';
import {
  getOrderedTabs,
  handleGetAllMatchesMsg,
  handleNextPrevMatch,
  handleRemoveAllHighlightMatches,
  handleToggleStylesAllTabs,
  handleUpdateLayoverPosition,
  handleUpdateTabStatesObj,
  queryCurrentWindowTabs,
  switchTab,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
import {
  createSwitchedActiveTabHideLayoverMsg,
  createSwitchedActiveTabShowLayoverMsg,
  createToggleSearchLayoverMsg,
} from '../utils/messageUtils/createMessages';
import { sendMsgToTab } from '../utils/messageUtils/sendMessageToContentScripts';
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
        await switchTab(message.serializedState);
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
// chrome.tabs.onActivated.addListener(async ({ tabId }) => {
//   const orderedTabs = await getOrderedTabs(false);

//   const msg = createSwitchedActiveTabShowLayoverMsg();
//   sendMsgToTab<SwitchedActiveTabShowLayover>(tabId, msg);

//   const inactiveTabs = orderedTabs.filter((tab) => tab.id !== tabId);

//   const msg2 = createSwitchedActiveTabHideLayoverMsg();

//   for (const otherTab of inactiveTabs) {
//     if (otherTab.id) {
//       sendMsgToTab<SwitchedActiveTabHideLayover>(otherTab.id, msg2);
//     }
//   }

//   sendStoreToContentScripts(store);
// });

// FIXME: MESSAGE TPYE?
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_search_layover') {
    const tabs = await queryCurrentWindowTabs(true);

    if (tabs[0].id) {
      // const msg = createToggleSearchLayoverMsg();
      // sendMsgToTab<ToggleSearchLayoverMsg>(tabs[0].id, msg);
      sendMessageToTab(tabs[0].id, { command });
    }
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

  // export function createToggleStylesMsg(
  //   addStyles: boolean,
  //   payload: any
  // ): ToggleStylesMsg {
  //   return {
  //     from: 'background:backgroundUtils',
  //     type: addStyles ? 'add-styles' : 'remove-styles',
  //     payload,
  //   };
  // }
});
