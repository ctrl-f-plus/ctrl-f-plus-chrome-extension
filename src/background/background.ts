// src/background/background.ts

import {
  Messages,
  PRINT_STORE,
  UpdateHighlightsMsg,
} from '../types/message.types';
import {
  executeContentScriptOnAllTabs,
  getOrderedTabs,
  handleRemoveAllHighlightMatches,
  handleUpdateLayoverPosition,
  handleUpdateTabStatesObj,
  queryCurrentWindowTabs,
  switchTab,
  toggleLayoverAndMatchesAllTabs,
  updateTotalTabsCount,
} from '../utils/backgroundUtils';
import { createUpdateHighlightsMsg } from '../utils/messageUtils/createMessages';
import {
  sendMessageToContentScripts,
  sendMsgToTab,
} from '../utils/messageUtils/sendMessageToContentScripts';
import { clearLocalStorage } from '../utils/storage';
import {
  initStore,
  resetPartialStore,
  sendPrintStoreTOContentScripts,
  sendStoreToContentScripts,
  updateStore,
} from './store';

export const store = initStore();
sendStoreToContentScripts(store, 'init');

let printMsg: PRINT_STORE = {
  from: 'background',
  type: 'PRINT_STORE',
  payload: {},
};

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    console.log('Received message:', message, ' \n Store: ', store);

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
          sendStoreToContentScripts(store, 'get-all-matches-ms -> ');
          return;
        }

        await executeContentScriptOnAllTabs(payload, store);
        sendStoreToContentScripts(
          store,
          'get-all-matches-msg - exec on all tabs'
        );

        sendPrintStoreTOContentScripts(store);

        return true;
      case 'remove-styles-all-tabs':
        updateStore(store, {
          showLayover: false,
          showMatches: false,
        });
        sendStoreToContentScripts(store, 'remove-styles-all-tabs');

        sendPrintStoreTOContentScripts(store);
        return true;
      case 'remove-all-highlight-matches':
        await handleRemoveAllHighlightMatches(sendResponse);
        sendStoreToContentScripts(store, 'remove-all-highlight-matches');

        sendPrintStoreTOContentScripts(store);
        break;
      case 'CLOSE_SEARCH_OVERLAY':
        updateStore(store, {
          showLayover: false,
          showMatches: false,
        });
        sendStoreToContentScripts(store, 'CLOSE_SEARCH_OVERLAY');

        sendPrintStoreTOContentScripts(store);
        break;
      case 'switch-tab':
        await switchTab(message.serializedState);

        sendPrintStoreTOContentScripts(store);
        return true;
      case 'update-tab-states-obj':
        console.log('update-tab-states-obj');
        await handleUpdateTabStatesObj(payload, sendResponse);
        sendPrintStoreTOContentScripts(store);
        return true;
      case 'update-layover-position':
        await handleUpdateLayoverPosition(store, payload.newPosition);
        sendPrintStoreTOContentScripts(store);
        return;
      // case 'state-update':
      //   console.log('state-update');
      //   return;
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
  updateStore(store, { activeTabId: tabId });

  if (store.showLayover) {
    sendStoreToContentScripts(store, 'onActivated');
  }
});

// FIXME: MESSAGE TPYE?
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_search_layover') {
    const addStyles = !store.showLayover;
    // const addStyles = true;

    // const tabs = await queryCurrentWindowTabs();
    updateStore(store, {
      showLayover: addStyles,
      showMatches: addStyles,
    });
    // await toggleLayoverAndMatchesAllTabs(addStyles);
    // console.log('store:', store, '\naddStyles: ', addStyles, '\ntabs: ', tabs);
    // debugger;

    sendStoreToContentScripts(store, 'onCommand');
    sendPrintStoreTOContentScripts(store);

    // const msg = createUpdateHighlightsMsg(store.activeTabId as number);

    // await sendMsgToTab<UpdateHighlightsMsg>(store.activeTabId, msg);

    console.log(store);
  }
});

chrome.tabs.onCreated.addListener(() => {
  updateTotalTabsCount(store);
  sendStoreToContentScripts(store, 'onCreated');
});

chrome.tabs.onRemoved.addListener(() => {
  updateTotalTabsCount(store);
  sendStoreToContentScripts(store, 'onRemoved');
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
      sendStoreToContentScripts(store, 'windows.get');
    }

    store.lastFocusedWindowId = windowId;
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  await clearLocalStorage();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  sendStoreToContentScripts(store, 'onUpdated');
});
