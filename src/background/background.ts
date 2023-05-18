// src/background/background.ts

import {
  Messages,
  SwitchedActiveTabHideLayover,
  SwitchedActiveTabShowLayover,
} from '../types/message.types';
import {
  executeContentScriptOnAllTabs,
  getOrderedTabs,
  // handleRemoveAllHighlightMatches,
  handleUpdateLayoverPosition,
  handleUpdateTabStatesObj,
  switchTab,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
import {
  createSwitchedActiveTabHideLayoverMsg,
  createSwitchedActiveTabShowLayoverMsg,
} from '../utils/messageUtils/createMessages';
import { sendMsgToTab } from '../utils/messageUtils/sendMessageToContentScripts';
import { clearLocalStorage } from '../utils/storage';
import {
  initStore,
  resetPartialStore,
  sendStoreToContentScripts,
  updateStore,
} from './store';

export const store = initStore();
sendStoreToContentScripts(store);

// TODO: - add useEffect updates to contentScript?

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    console.log('Received message:', message, ' \n Store: ', store);
    // return;

    const { type, payload, transactionId } = message;

    switch (type) {
      case 'get-all-matches-msg':
        const findValue = payload; //FIXME: refactor

        resetPartialStore(store);

        updateStore(store, {
          findValue,
          searchValue: findValue,
          lastSearchValue: findValue,
        });

        if (findValue === '') {
          sendStoreToContentScripts(store);
          return;
        }

        await executeContentScriptOnAllTabs(payload, store);
        sendStoreToContentScripts(store);

        return true;
      case 'remove-styles-all-tabs':
        updateStore(store, {
          showLayover: false,
          showMatches: false,
        });
        sendStoreToContentScripts(store);
        return true;
      // case 'remove-all-highlight-matches':
      // await handleRemoveAllHighlightMatches(sendResponse);
      // sendStoreToContentScripts(store);
      // break;
      case 'add-styles-all-tabs':
        updateStore(store, {
          showLayover: true,
          showMatches: true,
        });
        return true;
      case 'CLOSE_SEARCH_OVERLAY':
        updateStore(store, {
          showLayover: false,
          showMatches: false,
        });
        sendStoreToContentScripts(store);
        break;

      case 'switch-tab':
        await switchTab(message.serializedState);
        return true;
      case 'update-tab-states-obj':
        console.log('update-tab-states-obj');
        await handleUpdateTabStatesObj(payload, sendResponse);
        return true;
      case 'update-layover-position':
        await handleUpdateLayoverPosition(store, payload.newPosition);
        return;
      case 'state-update':
        console.log('state-update');
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
  if (store.showLayover) {
    const orderedTabs = await getOrderedTabs(false);

    const msg = createSwitchedActiveTabShowLayoverMsg();
    sendMsgToTab<SwitchedActiveTabShowLayover>(tabId, msg);

    const inactiveTabs = orderedTabs.filter((tab) => tab.id !== tabId);

    const msg2 = createSwitchedActiveTabHideLayoverMsg();

    for (const otherTab of inactiveTabs) {
      if (otherTab.id) {
        sendMsgToTab<SwitchedActiveTabHideLayover>(otherTab.id, msg2);
      }
    }
  }
  // sendStoreToContentScripts(store);
});

// FIXME: MESSAGE TPYE?
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_search_layover') {
    const addStyles = !store.showLayover;
    updateStore(store, {
      showLayover: addStyles,
      showMatches: addStyles,
    });
    sendStoreToContentScripts(store);
    console.log(store);
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
