// import calculateTargetIndex from '../../helpers/calculateTargetIndex';

// import { UpdateHighlightsMsg } from '../../types/message.types';
// import { Direction } from '../../types/shared.types';
// import { SerializedTabState, ValidTabId } from '../../types/tab.types';
// import sendMessageToTab from '../../utils/messageUtils/sendMessageToContentScripts';
// import { calculateTargetMatchIndex } from '../backgroundUtils';
// import { getActiveTabId } from './chromeAPI';
// import { getOrderedTabIds } from './toOrganize';
// import store from '../databaseStore';

// /**
//  case 'switch-tab': {
//     await handleSwitchTab(
//       activeWindowStore,
//       payload.serializedState,
//       payload.direction
//     );
//     // updateTabStore(activeWindowStore, payload.serializedState);
//     // await switchToTargetTab(
//     //   activeWindowStore,
//     //   payload.serializedState,
//     //   payload.direction
//     // );
//     // await sendStoreToContentScripts(activeWindowStore);
//     // await updateActiveTabState(activeWindowStore, payload.direction);

//     return true;
//   }
//  */
// // const { activeWindowStore } = store;***
// export async function switchToTargetTab(
//   serializedState: SerializedTabState,
//   direction: Direction
// ): Promise<void> {
//   const { activeWindowStore } = store;
//   const orderedTabIds: ValidTabId[] = await getOrderedTabIds();
//   const currentTabIndex = orderedTabIds.findIndex(
//     (currentTabId) => currentTabId === serializedState.tabId
//   );

//   const targetTabIndex = calculateTargetIndex(
//     direction,
//     currentTabIndex,
//     orderedTabIds.length
//   );
//   const targetTabId = orderedTabIds[targetTabIndex];
//   const targetTabSerializedTabState =
//     activeWindowStore.tabStores[targetTabId]?.serializedTabState;

//   if (targetTabSerializedTabState) {
//     targetTabSerializedTabState.currentIndex = calculateTargetMatchIndex(
//       direction,
//       targetTabSerializedTabState.matchesCount || 0
//     );
//     chrome.tabs.update(targetTabId, { active: true });
//   }
// }

// export async function updateActiveTabState(
//   direction: Direction
// ): Promise<void> {
//   const { activeWindowStore } = store;
//   const activeTabId = (await getActiveTabId()) as unknown as ValidTabId;

//   if (activeTabId && activeWindowStore) {
//     const { newSerializedState } = await sendMessageToTab<UpdateHighlightsMsg>(
//       activeTabId,
//       {
//         async: true,
//         from: 'background',
//         type: 'update-highlights',
//         payload: {
//           tabId: activeTabId,
//           direction,
//         },
//       }
//     );

//     activeWindowStore.tabStores[activeTabId].serializedTabState =
//       newSerializedState;
//   }
// }
