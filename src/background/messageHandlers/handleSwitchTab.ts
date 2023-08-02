// src/background/messageHandlers/handleSwitchTab.ts

import { UPDATE_HIGHLIGHTS, UpdateHighlightsMsg } from '../types/message.types';
import { Direction } from '../../shared/types/shared.types';
import {
  SerializedTabState,
  ValidTabId,
} from '../../contentScripts/types/tab.types';
import store from '../store/databaseStore';
import {
  getActiveTabId,
  getOrderedTabIds,
  toValidTabId,
} from '../utils/chromeApiUtils';
import calculateTargetIndex from '../../contentScripts/utils/search/calculateTargetIndex';
import sendMessageToTab from '../utils/sendMessageToContent';

function calculateTargetMatchIndex(direction: Direction, matchesCount: number) {
  return direction === Direction.NEXT ? 0 : matchesCount - 1;
}

export default async function handleSwitchTab(
  serializedState: SerializedTabState,
  direction: Direction
): Promise<void> {
  if (serializedState.tabId === undefined) {
    console.warn('switchTab: Tab ID is undefined:', serializedState);
    return;
  }
  const { activeWindowStore } = store;

  // updateTabStore(activeWindowStore, serializedState);
  const {
    tabId,
    currentIndex,
    matchesCount,
    serializedMatches,
    globalMatchIdxStart,
  } = serializedState;

  activeWindowStore.update({
    tabStores: {
      ...activeWindowStore.tabStores,
      [tabId]: {
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

  const orderedTabIds: ValidTabId[] = await getOrderedTabIds();
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

  await activeWindowStore.sendToContentScripts();
  const activeTabId = toValidTabId(await getActiveTabId());
  const { newSerializedState } = await sendMessageToTab<UpdateHighlightsMsg>(
    activeTabId,
    {
      async: true,
      type: UPDATE_HIGHLIGHTS,
      payload: {
        tabId: activeTabId,
        direction,
      },
    }
  );

  activeWindowStore.tabStores[activeTabId].serializedTabState =
    newSerializedState;
}
