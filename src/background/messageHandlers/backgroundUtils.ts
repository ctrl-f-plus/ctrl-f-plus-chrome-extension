// // src/utils/backgroundUtils.ts

// import calculateTargetIndex from '../helpers/calculateTargetIndex';

// import {
//   HighlightMsg,
//   RemoveAllHighlightMatchesMsg,
//   UpdateHighlightsMsg,
// } from '../types/message.types';
// import { Direction } from '../types/shared.types';
// import { SerializedTabState, ValidTabId } from '../types/tab.types';
// import { DIRECTION_NEXT } from '../utils/constants';
// import sendMessageToTab from '../utils/messageUtils/sendMessageToContentScripts';
// import store from './databaseStore';
// import { getActiveTabId, queryCurrentWindowTabs } from './helpers/chromeAPI';
// import { getOrderedTabIds, getOrderedTabs } from './helpers/toOrganize';
// import { setStoredTabs } from './storage';
// import { sendStoreToContentScripts } from './store';

// async function findMatchesOnTab(
//   tabId: ValidTabId,
//   foundFirstMatch: boolean
// ): Promise<{
//   hasMatch: boolean;
//   serializedState: SerializedTabState;
// }> {
//   const { activeWindowStore } = store;
//   const response = await sendMessageToTab<HighlightMsg>(tabId, {
//     async: true,
//     from: 'background',
//     type: 'highlight',
//     payload: {
//       findValue: activeWindowStore.searchValue,
//       foundFirstMatch,
//       tabId,
//     },
//   });
//   return response;
// }

// // FIXME: might make sense to refactor the loop to get all matches and then update the start indexes after
// export async function handleGetAllMatches(
//   searchValue: string
// ): Promise<boolean> {
//   const { activeWindowStore } = store;
//   activeWindowStore.resetPartialStore();
//   activeWindowStore.update({
//     searchValue,
//     lastSearchValue: searchValue,
//   });

//   if (searchValue === '') {
//     sendStoreToContentScripts(activeWindowStore);
//     return false;
//   }

//   const orderedTabs = await getOrderedTabs();
//   let foundFirstMatch = false;

//   /* eslint-disable no-await-in-loop */
//   for (let i = 0; i < orderedTabs.length; i += 1) {
//     const tab = orderedTabs[i];
//     const tabId: ValidTabId = tab.id as number;

//     const { hasMatch, serializedState } = await findMatchesOnTab(
//       tabId,
//       foundFirstMatch
//     );

//     if (!hasMatch) {
//       continue;
//     }

//     await setStoredTabs(serializedState);

//     serializedState.globalMatchIdxStart = activeWindowStore.totalMatchesCount;

//     activeWindowStore.updateTotalMatchesCount(
//       activeWindowStore.totalMatchesCount + serializedState.matchesCount
//     );

//     activeWindowStore.update({
//       tabStores: {
//         ...activeWindowStore.tabStores,
//         [tabId]: {
//           tabId,
//           serializedTabState: serializedState,
//         },
//       },
//     });

//     if (foundFirstMatch) {
//       continue;
//     }

//     foundFirstMatch = true;
//     const activeTab = orderedTabs[0];
//     if (activeTab.id !== tabId) {
//       chrome.tabs.update(tabId, { active: true });
//     }
//   }
//   /* eslint-enable no-await-in-loop */

//   sendStoreToContentScripts(activeWindowStore);
//   return true;
// }

// function calculateTargetMatchIndex(direction: Direction, matchesCount: number) {
//   return direction === DIRECTION_NEXT ? 0 : matchesCount - 1;
// }

// export async function handleSwitchTab(
//   serializedState: SerializedTabState,
//   direction: Direction
// ): Promise<void> {
//   if (serializedState.tabId === undefined) {
//     console.warn('switchTab: Tab ID is undefined:', serializedState);
//     return;
//   }
//   const { activeWindowStore } = store;

//   // updateTabStore(activeWindowStore, serializedState);
//   const {
//     tabId,
//     currentIndex,
//     matchesCount,
//     serializedMatches,
//     globalMatchIdxStart,
//   } = serializedState;

//   activeWindowStore.update({
//     tabStores: {
//       ...activeWindowStore.tabStores,
//       [tabId]: {
//         tabId,
//         serializedTabState: {
//           tabId,
//           currentIndex,
//           matchesCount,
//           serializedMatches,
//           globalMatchIdxStart,
//         },
//       },
//     },
//   });

//   const orderedTabIds: ValidTabId[] = await getOrderedTabIds();
//   const tabCount = orderedTabIds.length;
//   const currentTabIndex = orderedTabIds.findIndex(
//     (currentTabId) => currentTabId === serializedState.tabId
//   );

//   const targetTabIndex = calculateTargetIndex(
//     direction,
//     currentTabIndex,
//     tabCount
//   );
//   const targetTabId = orderedTabIds[targetTabIndex];
//   const targetTabSerializedTabState =
//     activeWindowStore.tabStores[targetTabId]?.serializedTabState;

//   targetTabSerializedTabState.currentIndex = calculateTargetMatchIndex(
//     direction,
//     targetTabSerializedTabState.matchesCount || 0
//   );

//   chrome.tabs.update(targetTabId, { active: true });

//   await sendStoreToContentScripts(activeWindowStore);

//   const activeTabId = (await getActiveTabId()) as unknown as ValidTabId;

//   const { newSerializedState } = await sendMessageToTab<UpdateHighlightsMsg>(
//     activeTabId,
//     {
//       async: true,
//       from: 'background',
//       type: 'update-highlights',
//       payload: {
//         tabId: activeTabId,
//         direction,
//       },
//     }
//   );

//   activeWindowStore.tabStores[activeTabId].serializedTabState =
//     newSerializedState;
// }

// // FIXME: Create a ts type of sendResponse and update throughout codebase
// export async function handleRemoveAllHighlightMatches(
//   sendResponse: (response?: any) => void
// ) {
//   const tabs = await queryCurrentWindowTabs();

//   const tabPromises = tabs.map((tab) => {
//     if (tab.id) {
//       const msg: RemoveAllHighlightMatchesMsg = {
//         async: false,
//         from: 'background:backgroundUtils',
//         type: 'remove-all-highlight-matches',
//         payload: {
//           tabId: tab.id,
//         },
//       };
//       return sendMessageToTab<RemoveAllHighlightMatchesMsg>(tab.id, msg);
//     }
//     return Promise.resolve(null);
//   });

//   const responses = await Promise.all(tabPromises);
//   sendResponse(responses);

//   return true;
// }

// // FIXME: REFACTOR
// export async function handleUpdateTabStatesObj(
//   payload: {
//     serializedState: SerializedTabState;
//   },
//   sendResponse: (response?: any) => void
// ) {
//   const { activeWindowStore } = store;
//   const {
//     serializedState: {
//       currentIndex,
//       globalMatchIdxStart,
//       matchesCount,
//       serializedMatches,
//       tabId,
//     },
//   } = payload;

//   if (tabId === undefined) {
//     console.warn('handleUpdateTabStatesObj: Tab ID is undefined:', payload);
//     return;
//   }

//   await setStoredTabs(payload.serializedState);

//   activeWindowStore.setUpdatedTabsCount(activeWindowStore.updatedTabsCount + 1);

//   if (activeWindowStore.updatedTabsCount === activeWindowStore.totalTabs) {
//     activeWindowStore.updateMatchesCount();
//     activeWindowStore.setUpdatedTabsCount(0);
//   }

//   activeWindowStore.update({
//     tabStores: {
//       ...activeWindowStore.tabStores,
//       [tabId]: {
//         ...activeWindowStore.tabStores[tabId],
//         tabId,
//         serializedTabState: {
//           tabId,
//           currentIndex,
//           matchesCount,
//           serializedMatches,
//           globalMatchIdxStart,
//         },
//       },
//     },
//   });

//   sendResponse({ status: 'success' });
// }
