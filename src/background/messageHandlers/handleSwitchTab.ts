// src/background/messageHandlers/handleSwitchTab.ts

import calculateTargetIndex from '../../helpers/calculateTargetIndex';
import { UpdateHighlightsMsg } from '../../types/message.types';
import { Direction } from '../../types/shared.types';
import { SerializedTabState, ValidTabId } from '../../types/tab.types';
import { DIRECTION_NEXT } from '../../utils/constants';
import sendMessageToTab from '../../utils/messageUtils/sendMessageToContentScripts';
import store from '../store/databaseStore';
import { sendStoreToContentScripts } from '../store/store';
import { getActiveTabId, getOrderedTabIds } from '../utils/chromeApiUtils';

function calculateTargetMatchIndex(direction: Direction, matchesCount: number) {
  return direction === DIRECTION_NEXT ? 0 : matchesCount - 1;
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

  activeWindowStore.tabStores[activeTabId].serializedTabState =
    newSerializedState;
}
