// /* eslint-disable import/prefer-default-export */
// // src/background/store.ts

// import { TabStore } from '../../types/Store.types';
// import { ValidTabId } from '../../types/tab.types';
// import { WindowStore } from './windowStore';

// export function createTabStore(
//   windowStore: WindowStore,
//   tabId: ValidTabId
// ): TabStore {
//   let serializedTabState = windowStore.tabStores[tabId]?.serializedTabState;

//   if (serializedTabState === undefined) {
//     serializedTabState = {
//       tabId,
//       currentIndex: 0,
//       matchesCount: 0,
//       serializedMatches: '',
//       globalMatchIdxStart: -1,
//     };
//   }

//   return {
//     tabId,
//     serializedTabState,
//     totalMatchesCount: windowStore.totalMatchesCount,
//     layoverPosition: windowStore.layoverPosition,
//     showLayover: windowStore.showLayover,
//     showMatches: windowStore.showMatches,
//     searchValue: windowStore.searchValue,
//     lastSearchValue: windowStore.lastSearchValue,
//     activeTabId: windowStore.activeTabId,
//   };
// }

// // export async function sendToContentScripts(
// //   tabIds: ValidTabId[] = []
// // ): Promise<(boolean | Error)[]> {
// //   const currentWindowTabs = await queryCurrentWindowTabs();

// //   let validatedTabIds;
// //   if (tabIds.length === 0) {
// //     validatedTabIds = currentWindowTabs
// //       .map((tab) => tab.id)
// //       .filter((id): id is ValidTabId => id !== undefined);
// //   }

// //   const promises = (validatedTabIds || []).map((tabId) => {
// //     const tabStore = createTabStore(this, tabId);

// //     return sendMessageToTab<UpdateStoreMsg>(tabId, {
// //       async: true,
// //       from: 'background:store',
// //       type: 'store-updated',
// //       payload: {
// //         tabId,
// //         tabStore,
// //       },
// //     });
// //   });

// //   return Promise.all(promises);
// // }
