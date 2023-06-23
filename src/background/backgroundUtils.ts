// src/utils/backgroundUtils.ts

import calculateTargetIndex from '../helpers/calculateTargetIndex';
import { WindowStore } from '../types/Store.types';
import {
  HighlightMsg,
  RemoveAllHighlightMatchesMsg,
  UpdateHighlightsMsg,
} from '../types/message.types';
import { SerializedTabState, ValidTabId } from '../types/tab.types';
import sendMessageToTab from '../utils/messageUtils/sendMessageToContentScripts';
import { getActiveTabId, queryCurrentWindowTabs } from './helpers/chromeAPI';
import { getOrderedTabIds, getOrderedTabs } from './helpers/toOrganize';
import { setStoredTabs } from './storage';
import {
  sendStoreToContentScripts,
  updateMatchesCount,
  updateStore,
  updateTabStore,
} from './store';

/**
 *  Utility/Helper Functions:
 */

// 'Match X/Y (Total: Z)';

async function executeContentScriptOnTab(
  tab: chrome.tabs.Tab,
  windowStore: WindowStore,
  foundFirstMatch: boolean
): Promise<{
  hasMatch: boolean;
  state: any;
}> {
  try {
    const tabId: ValidTabId = tab.id as number;

    const msg: HighlightMsg = {
      async: true,
      from: 'background',
      type: 'highlight',
      payload: {
        findValue: windowStore.searchValue,
        foundFirstMatch,
        tabId,
      },
    };
    const response = await sendMessageToTab<HighlightMsg>(tabId, msg);

    const { currentIndex, matchesCount, serializedMatches } =
      response.serializedState;

    await setStoredTabs(response.serializedState);

    const globalMatchIdxStart = windowStore.totalMatchesCount;

    updateStore(windowStore, {
      totalMatchesCount: windowStore.totalMatchesCount + matchesCount,
    });

    // updateStore(windowStore, {
    //   tabStores: {
    //     ...windowStore.tabStores,
    //     [tabId]: {
    //       tabId,
    //       serializedTabState: {
    //         tabId,
    //         currentIndex,
    //         matchesCount,
    //         serializedMatches,
    //         globalMatchIdxStart,
    //       },
    //     },
    //   },
    // });
    // updateTabStore(windowStore, response.serializedState);
    updateTabStore(windowStore, {
      tabId,
      currentIndex,
      matchesCount,
      serializedMatches,
      globalMatchIdxStart,
    });

    return response;
  } catch (error) {
    return { hasMatch: false, state: null };
  }
}

/* eslint-disable no-await-in-loop */ // FIXME: might make sense to refactor the loop to get all matches and then update the start indexes after
export async function executeContentScriptOnAllTabs(windowStore: WindowStore) {
  const orderedTabs = await getOrderedTabs(windowStore);
  let foundFirstMatch = false;
  // let firstMatchTabIndex = orderedTabs.length; // default to length, as if no match found

  // Process tabs one by one until the first match
  for (let i = 0; i < orderedTabs.length; i += 1) {
    const tab = orderedTabs[i];

    if (tab.id) {
      const tabId: ValidTabId = tab.id as number;

      const { hasMatch } = await executeContentScriptOnTab(
        tab,
        windowStore,
        foundFirstMatch
      );

      if (hasMatch && !foundFirstMatch) {
        foundFirstMatch = true;
        // firstMatchTabIndex = i; // TODO: REVIEW THIS <- figure out how it was previously used and if it would be helpful to add back

        const activeTab = orderedTabs[0];
        if (activeTab.id !== tabId) {
          chrome.tabs.update(tabId, { active: true });
        }
      }
    }
  }
  /* eslint-enable no-await-in-loop */

  // Process the remaining tabs asynchronously
  // const remainingTabs = orderedTabs.slice(firstMatchTabIndex + 1);
  // const tabPromises = remainingTabs.map((tab) => {
  //   if (tab.id) {
  //     return executeContentScriptOnTab(tab, windowStore, foundFirstMatch);
  //   }
  // });

  // await Promise.allSettled(tabPromises);
}

// TODO: add ts type for direction
export function calculateTargetMatchIndex(
  direction: any,
  matchesCount: number
) {
  return direction === 'next' ? 0 : matchesCount - 1;
}

export async function handleSwitchTab(
  activeWindowStore: WindowStore,
  serializedState: SerializedTabState,
  direction: 'next' | 'previous'
): Promise<void> {
  if (serializedState.tabId === undefined) {
    console.warn('switchTab: Tab ID is undefined:', serializedState);
    return;
  }

  updateTabStore(activeWindowStore, serializedState);

  const orderedTabIds: ValidTabId[] = await getOrderedTabIds(activeWindowStore);
  const tabCount = orderedTabIds.length;
  const currentTabIndex = orderedTabIds.findIndex(
    (currentTabId) => currentTabId === serializedState.tabId
  );

  const targetTabIndex = calculateTargetIndex(
    direction,
    currentTabIndex,
    tabCount
  );
  const targetTabId = orderedTabIds[targetTabIndex];
  const targetTabSerializedTabState =
    activeWindowStore.tabStores[targetTabId]?.serializedTabState;

  targetTabSerializedTabState.currentIndex = calculateTargetMatchIndex(
    direction,
    targetTabSerializedTabState.matchesCount || 0
  );

  chrome.tabs.update(targetTabId, { active: true });

  await sendStoreToContentScripts(activeWindowStore);

  const activeTabId = (await getActiveTabId()) as unknown as ValidTabId;

  const { newSerializedState } = await sendMessageToTab<UpdateHighlightsMsg>(
    activeTabId,
    {
      async: true,
      from: 'background',
      type: 'update-highlights',
      payload: {
        tabId: activeTabId,
        direction,
      },
    }
  );

  if (activeWindowStore) {
    activeWindowStore.tabStores[activeTabId].serializedTabState =
      newSerializedState;
  }
}

// FIXME: Create a ts type of sendResponse and update throughout codebase
export async function handleRemoveAllHighlightMatches(
  sendResponse: (response?: any) => void
) {
  const tabs = await queryCurrentWindowTabs();

  const tabPromises = tabs.map((tab) => {
    if (tab.id) {
      const msg: RemoveAllHighlightMatchesMsg = {
        async: false,
        from: 'background:backgroundUtils',
        type: 'remove-all-highlight-matches',
        payload: {
          tabId: tab.id,
        },
      };
      return sendMessageToTab<RemoveAllHighlightMatchesMsg>(tab.id, msg);
    }
    return Promise.resolve(null);
  });

  const responses = await Promise.all(tabPromises);
  sendResponse(responses);

  return true;
}

// FIXME: REFACTOR
export async function handleUpdateTabStatesObj(
  windowStore: WindowStore,
  payload: {
    serializedState: SerializedTabState;
  },
  sendResponse: (response?: any) => void
) {
  const {
    serializedState: {
      currentIndex,
      globalMatchIdxStart,
      matchesCount,
      serializedMatches,
      tabId,
    },
  } = payload;

  if (tabId === undefined) {
    console.warn('handleUpdateTabStatesObj: Tab ID is undefined:', payload);
    return;
  }

  await setStoredTabs(payload.serializedState);

  windowStore.updatedTabsCount += 1;

  if (windowStore.updatedTabsCount === windowStore.totalTabs) {
    updateMatchesCount(windowStore);
    windowStore.updatedTabsCount = 0;
  }

  updateStore(windowStore, {
    tabStores: {
      ...windowStore.tabStores,
      [tabId]: {
        ...windowStore.tabStores[tabId],
        tabId,
        serializedTabState: {
          tabId,
          currentIndex,
          matchesCount,
          serializedMatches,
          globalMatchIdxStart,
        },
      },
    },
  });

  sendResponse({ status: 'success' });
}
