// src/background/messageHandlers/handleUpdateTabStatesObj.ts

import { SerializedTabState } from '../../types/tab.types';
import store from '../store/databaseStore';
import { setStoredTabs } from '../../utils/background/storage';

// FIXME: REFACTOR
export default async function handleUpdateTabStatesObj(
  payload: {
    serializedState: SerializedTabState;
  },
  sendResponse: (response?: any) => void
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
    console.warn('handleUpdateTabStatesObj: Tab ID is undefined:', payload);
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
