// src/utils/backgroundUtils.ts

import { store } from '../background/background';
import { Store, updateStore } from '../background/store';
import { LayoverPosition } from '../components/Layover';
import {
  HighlightMsg,
  RemoveAllHighlightMatchesMsg,
  ToggleStylesMsg,
  UpdateHighlightsMsg,
} from '../types/message.types';
import { SerializedTabState, ValidTabId } from '../types/tab.types';
import {
  getAllStoredTabs,
  setStoredLayoverPosition,
  setStoredTabs,
} from '../utils/storage';
import {
  createHighlightMsg,
  createRemoveAllHighlightMatchesMsg,
  createToggleStylesMsg,
  createUpdateHighlightsMsg,
} from './messageUtils/createMessages';
import { sendMsgToTab } from './messageUtils/sendMessageToContentScripts';

/**
 *  Utility/Helper Functions:
 */
export async function queryCurrentWindowTabs(
  activeTab: boolean | undefined = undefined
): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: activeTab, currentWindow: true }, resolve);
  });
}

export async function getOrderedTabs(
  includeActiveTab: boolean = true
): Promise<chrome.tabs.Tab[]> {
  const tabs = await queryCurrentWindowTabs();
  const activeTabIndex = tabs.findIndex((tab) => tab.active);
  const startSliceIdx = includeActiveTab ? activeTabIndex : activeTabIndex + 1;

  const orderedTabs = [
    ...tabs.slice(startSliceIdx),
    ...tabs.slice(0, activeTabIndex),
  ];

  return orderedTabs;
}

// FIXME: Figure out if/when this actually ever gets called, then remove debugger
export async function updateMatchesCount() {
  const storedTabs = await getAllStoredTabs();

  let totalMatchesCount = 0;
  for (const tabId in storedTabs) {
    if (storedTabs.hasOwnProperty(tabId)) {
      totalMatchesCount += storedTabs[tabId]?.matchesCount ?? 0;
    }
  }

  updateStore(store, {
    totalMatchesCount,
  });
}

// 'Match X/Y (Total: Z)';
export async function updateTotalTabsCount(store: Store) {
  const tabs = await queryCurrentWindowTabs();
  store.totalTabs = tabs.length;
}

async function executeContentScriptOnTab(
  tab: chrome.tabs.Tab,
  store: Store,
  foundFirstMatch: boolean
): Promise<{
  hasMatch: boolean;
  state: any;
}> {
  return new Promise<{ hasMatch: boolean; state: any }>(
    async (resolve, reject) => {
      const tabId: ValidTabId = tab.id as number;

      try {
        const msg = createHighlightMsg(store.findValue, tabId, foundFirstMatch);
        const response = await sendMsgToTab<HighlightMsg>(tabId, msg);

        const { currentIndex, matchesCount, serializedMatches } =
          response.serializedState;

        await setStoredTabs(response.serializedState);

        const globalMatchIdxStart = store.totalMatchesCount;

        updateStore(store, {
          totalMatchesCount: store.totalMatchesCount + matchesCount,
        });

        updateStore(store, {
          tabStates: {
            ...store.tabStates,
            [tabId]: {
              tabId,
              currentIndex,
              matchesCount,
              serializedMatches,
              globalMatchIdxStart,
            },
          },
        });

        resolve(response);
      } catch (error) {
        reject({ hasMatch: false, state: null });
      }
    }
  );
}

export async function executeContentScriptOnAllTabs(
  findValue: string,
  store: Store
) {
  const orderedTabs = await getOrderedTabs();
  let foundFirstMatch = false;
  let firstMatchTabIndex = orderedTabs.length; // default to length, as if no match found

  // Process tabs one by one until the first match
  for (let i = 0; i < orderedTabs.length; i++) {
    const tab = orderedTabs[i];

    if (tab.id) {
      const tabId: ValidTabId = tab.id as number;
      const { hasMatch, state } = await executeContentScriptOnTab(
        tab,
        store,
        foundFirstMatch
      );

      if (hasMatch && !foundFirstMatch) {
        foundFirstMatch = true;
        firstMatchTabIndex = i;

        const activeTab = orderedTabs[0];
        if (activeTab.id !== tabId) {
          chrome.tabs.update(tabId, { active: true });
        }

        break;
      }
    }
  }

  // Process the remaining tabs asynchronously
  const remainingTabs = orderedTabs.slice(firstMatchTabIndex + 1);
  const tabPromises = remainingTabs.map((tab) => {
    if (tab.id) {
      return executeContentScriptOnTab(tab, store, foundFirstMatch);
    }
  });

  await Promise.allSettled(tabPromises);
}

export async function switchTab(
  serializedState: SerializedTabState
): Promise<void> {
  if (serializedState.tabId === undefined) {
    console.warn('switchTab: Tab ID is undefined:', serializedState);
    return;
  }

  const storedTabs = await getAllStoredTabs();
  const matchesObject = storedTabs;
  const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));
  const currentTabIndex = tabIds.findIndex(
    (tabId) => tabId === serializedState.tabId
  );

  const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
  const nextTabId = tabIds[nextTabIndex];

  chrome.tabs.update(nextTabId, { active: true }, async (tab) => {
    if (tab === undefined || tab.id === undefined) return;

    serializedState.tabId = tab.id;

    const msg = createUpdateHighlightsMsg(tab.id);

    await sendMsgToTab<UpdateHighlightsMsg>(tab.id, msg);

    updateStore(store, {
      globalMatchIdx: store.tabStates[nextTabId].globalMatchIdxStart,
    });
  });
}

/**
 * Event Handling Functions
 */

export async function toggleLayoverAndMatchesAllTabs(addStyles: boolean) {
  updateStore(store, {
    showLayover: addStyles,
    showMatches: addStyles,
  });
}

export async function handleRemoveAllHighlightMatches(sendResponse: Function) {
  const tabs = await queryCurrentWindowTabs();

  const tabPromises = tabs.map((tab) => {
    if (tab.id) {
      const msg = createRemoveAllHighlightMatchesMsg();
      return sendMsgToTab<RemoveAllHighlightMatchesMsg>(tab.id, msg);
    } else {
      return Promise.resolve(null);
    }
  });

  const responses = await Promise.all(tabPromises);
  sendResponse(responses);

  return true;
}

// FIXME: REFACTOR
export async function handleUpdateTabStatesObj(
  payload: any,
  sendResponse: Function
) {
  const {
    serializedState: {
      tabId,
      active,
      currentIndex,
      matchesCount,
      globalMatchIdxStart,
      serializedMatches,
    },
  } = payload;

  await setStoredTabs(payload.serializedState);
  // await setStoredTabs(serializedMatches);

  store.updatedTabsCount++;

  if (store.updatedTabsCount === store.totalTabs) {
    updateMatchesCount();
    store.updatedTabsCount = 0;
  }

  console.log(store);

  updateStore(store, {
    tabStates: {
      ...store.tabStates,
      [payload.serializedState.tabId]: {
        ...store.tabStates[payload.serializedState.tabId],
        tabId,
        active,
        currentIndex,
        matchesCount,
        globalMatchIdxStart,
        serializedMatches,
      },
    },
  });

  sendResponse({ status: 'success' });
}

export async function handleUpdateLayoverPosition(
  store: Store,
  newPosition: LayoverPosition
) {
  setStoredLayoverPosition(newPosition);

  updateStore(store, {
    layoverPosition: newPosition,
  });
}
