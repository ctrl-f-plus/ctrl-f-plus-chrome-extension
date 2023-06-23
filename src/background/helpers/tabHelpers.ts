import calculateTargetIndex from '../../helpers/calculateTargetIndex';
import { WindowStore } from '../../types/Store.types';
import { UpdateHighlightsMsg } from '../../types/message.types';
import { SerializedTabState, ValidTabId } from '../../types/tab.types';
import sendMessageToTab from '../../utils/messageUtils/sendMessageToContentScripts';
import { calculateTargetMatchIndex } from '../backgroundUtils';
import { getActiveTabId } from './chromeAPI';
import { getOrderedTabIds } from './toOrganize';

export async function switchToTargetTab(
  activeWindowStore: WindowStore,
  serializedState: SerializedTabState,
  direction: 'next' | 'previous'
): Promise<void> {
  const orderedTabIds: ValidTabId[] = await getOrderedTabIds(activeWindowStore);
  const currentTabIndex = orderedTabIds.findIndex(
    (currentTabId) => currentTabId === serializedState.tabId
  );

  const targetTabIndex = calculateTargetIndex(
    direction,
    currentTabIndex,
    orderedTabIds.length
  );
  const targetTabId = orderedTabIds[targetTabIndex];
  const targetTabSerializedTabState =
    activeWindowStore.tabStores[targetTabId]?.serializedTabState;

  if (targetTabSerializedTabState) {
    targetTabSerializedTabState.currentIndex = calculateTargetMatchIndex(
      direction,
      targetTabSerializedTabState.matchesCount || 0
    );
    chrome.tabs.update(targetTabId, { active: true });
  }
}

export async function updateActiveTabState(
  activeWindowStore: WindowStore,
  direction: 'next' | 'previous'
): Promise<void> {
  const activeTabId = (await getActiveTabId()) as unknown as ValidTabId;

  if (activeTabId && activeWindowStore) {
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
}
