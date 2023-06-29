// src/background/messageHandlers/handleUpdateTabStates.ts

import { SerializedTabState } from '../../contentScripts/types/tab.types';
import { ResponseCallback } from '../../shared/types/shared.types';
import store from '../store/databaseStore';
import { setStoredTabs } from '../utils/storage';

// FIXME: REFACTOR
export default async function handleUpdateTabStates(
  payload: {
    serializedState: SerializedTabState;
  },
  sendResponse: ResponseCallback
) {
  const { activeWindowStore } = store;
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
    console.warn('handleUpdateTabStates: Tab ID is undefined:', payload);
    return;
  }

  await setStoredTabs(payload.serializedState);

  activeWindowStore.setUpdatedTabsCount(activeWindowStore.updatedTabsCount + 1);

  if (activeWindowStore.updatedTabsCount === activeWindowStore.totalTabs) {
    activeWindowStore.updateMatchesCount();
    activeWindowStore.setUpdatedTabsCount(0);
  }

  activeWindowStore.update({
    tabStores: {
      ...activeWindowStore.tabStores,
      [tabId]: {
        ...activeWindowStore.tabStores[tabId],
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
