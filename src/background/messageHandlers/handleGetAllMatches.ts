// src/background/messageHandlers/handleGetAllMatches.ts

import { HighlightMsg } from '../../types/message.types';
import { SerializedTabState, ValidTabId } from '../../types/tab.types';
import sendMessageToTab from '../utils/sendMessageToContentScripts';
import store from '../store/databaseStore';
import { sendStoreToContentScripts } from '../store/store';
import { getOrderedTabs } from '../utils/chromeApiUtils';
import { setStoredTabs } from '../utils/storage';

async function findMatchesOnTab(
  tabId: ValidTabId,
  foundFirstMatch: boolean
): Promise<{
  hasMatch: boolean;
  serializedState: SerializedTabState;
}> {
  const { activeWindowStore } = store;
  const response = await sendMessageToTab<HighlightMsg>(tabId, {
    async: true,
    from: 'background',
    type: 'highlight',
    payload: {
      findValue: activeWindowStore.searchValue,
      foundFirstMatch,
      tabId,
    },
  });
  return response;
}

// FIXME: might make sense to refactor the loop to get all matches and then update the start indexes after
export default async function handleGetAllMatches(
  searchValue: string
): Promise<boolean> {
  const { activeWindowStore } = store;
  activeWindowStore.resetPartialStore();
  activeWindowStore.update({
    searchValue,
    lastSearchValue: searchValue,
  });

  if (searchValue === '') {
    sendStoreToContentScripts(activeWindowStore);
    return false;
  }

  const orderedTabs = await getOrderedTabs();
  let foundFirstMatch = false;

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < orderedTabs.length; i += 1) {
    const tab = orderedTabs[i];
    const tabId: ValidTabId = tab.id as number;

    const { hasMatch, serializedState } = await findMatchesOnTab(
      tabId,
      foundFirstMatch
    );

    if (!hasMatch) {
      continue;
    }

    await setStoredTabs(serializedState);

    serializedState.globalMatchIdxStart = activeWindowStore.totalMatchesCount;

    activeWindowStore.updateTotalMatchesCount(
      activeWindowStore.totalMatchesCount + serializedState.matchesCount
    );

    activeWindowStore.update({
      tabStores: {
        ...activeWindowStore.tabStores,
        [tabId]: {
          tabId,
          serializedTabState: serializedState,
        },
      },
    });

    if (foundFirstMatch) {
      continue;
    }

    foundFirstMatch = true;
    const activeTab = orderedTabs[0];
    if (activeTab.id !== tabId) {
      chrome.tabs.update(tabId, { active: true });
    }
  }
  /* eslint-enable no-await-in-loop */

  sendStoreToContentScripts(activeWindowStore);
  return true;
}
