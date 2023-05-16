// src/utils/backgroundUtils.ts

import { store } from '../background/background';
import {
  Store,
  resetPartialStore,
  resetStore,
  updateStore,
} from '../background/store';
import { LayoverPosition } from '../components/Layover';
import {
  HighlightMsg,
  TransactionId,
  RemoveAllHighlightMatchesMsg,
  ToggleStylesMsg,
  UpdateHighlightsMsg,
} from '../types/message.types';
import { SerializedTabState, ValidTabId } from '../types/tab.types';
import {
  getAllStoredTabs,
  setStoredLayoverPosition,
  setStoredTabs,
} from '../utils/storage';
import {
  createHighlightMsg,
  createNextMatchMsg,
  createPrevMatchMsg,
  createRemoveAllHighlightMatchesMsg,
  createToggleStylesMsg,
  createUpdateHighlightsMsg,
} from './messageUtils/createMessages';
import { sendMsgToTab } from './messageUtils/sendMessageToContentScripts';

/**
 *  Utility/Helper Functions:
 */
export async function queryCurrentWindowTabs(
  activeTab: boolean | undefined = undefined
): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: activeTab, currentWindow: true }, resolve);
  });
}

async function executeContentScriptOnTab(
  tab: chrome.tabs.Tab,
  store: Store,
  foundFirstMatch: boolean
): Promise<{
  hasMatch: boolean;
  state: any;
}> {
  return new Promise<{ hasMatch: boolean; state: any }>(
    async (resolve, reject) => {
      const tabId: ValidTabId = tab.id as number;
      console.log(`${tabId}: `, Date.now().toString());

      try {
        const msg = createHighlightMsg(store.findValue, tabId, foundFirstMatch);
        const response = await sendMsgToTab<HighlightMsg>(tabId, msg);

        const { currentIndex, matchesCount, serializedMatches } =
          response.serializedState;

        updateStore(store, {
          totalMatchesCount: store.totalMatchesCount + matchesCount,
        });

        updateStore(store, {
          tabStates: {
            ...store.tabStates,
            [tabId]: {
              tabId,
              currentIndex,
              matchesCount,
              serializedMatches,
              globalMatchIdxStart: store.totalMatchesCount,
            },
          },
        });

        resolve(response);
      } catch (error) {
        reject({ hasMatch: false, state: null });
      }
    }
  );
}

export async function getOrderedTabs(
  includeActiveTab: boolean = true
): Promise<chrome.tabs.Tab[]> {
  const tabs = await queryCurrentWindowTabs();
  const activeTabIndex = tabs.findIndex((tab) => tab.active);
  const startSliceIdx = includeActiveTab ? activeTabIndex : activeTabIndex + 1;

  const orderedTabs = [
    ...tabs.slice(startSliceIdx),
    ...tabs.slice(0, activeTabIndex),
  ];

  return orderedTabs;
}

// FIXME: Figure out if/when this actually ever gets called, then remove debugger
export async function updateMatchesCount() {
  // debugger;
  const storedTabs = await getAllStoredTabs();

  let totalMatchesCount = 0;
  for (const tabId in storedTabs) {
    if (storedTabs.hasOwnProperty(tabId)) {
      totalMatchesCount += storedTabs[tabId]?.matchesCount ?? 0;
    }
  }

  updateStore(store, {
    totalMatchesCount,
  });
}

// 'Match X/Y (Total: Z)';
export async function updateTotalTabsCount(store: Store) {
  const tabs = await queryCurrentWindowTabs();
  store.totalTabs = tabs.length;
}

/**
 *  Main Functions:
 */
// TODO: Refactor and separate out a processTab() function
export async function executeContentScriptOnAllTabs(
  findValue: string,
  store: Store
) {
  const orderedTabs = await getOrderedTabs();

  let foundFirstMatch = false;

  // for (const tab of orderedTabs) {
  const tabPromises = orderedTabs.map(async (tab) => {
    if (tab.id && !foundFirstMatch) {
      const tabId: ValidTabId = tab.id as number;
      const { hasMatch, state } = await executeContentScriptOnTab(
        tab,
        store,
        foundFirstMatch
      );

      if (!hasMatch || foundFirstMatch) {
        // continue;
        return;
      }

      foundFirstMatch = true;

      const activeTab = orderedTabs[0];
      if (activeTab.id !== tabId) {
        chrome.tabs.update(tabId, { active: true });
      }

      // // Process remaining tabs asynchronously
      // const remainingTabs = orderedTabs.slice(orderedTabs.indexOf(tab) + 1);
      // remainingTabs.forEach((remainingTab) => {
      //   if (remainingTab.id) {
      //     executeContentScriptOnTab(remainingTab, store, foundFirstMatch);
      //   }
      // });

      // break;
      // }
      // }
    } else if (tab.id) {
      await executeContentScriptOnTab(tab, store, foundFirstMatch);
    }
  });
  await Promise.all(tabPromises);
}

// export async function executeContentScriptWithMessage(
//   tabId: number,
//   messageType: string,
//   transactionId: TransactionId
// ): Promise<any> {
//   try {
//     let msg;

//     if (messageType === 'next-match') {
//       msg = createNextMatchMsg(tabId, transactionId);
//     } else if (messageType === 'prev-match') {
//       msg = createPrevMatchMsg();
//     } else {
//       throw new Error('Unsupported message type');
//     }

//     const response = await sendMsgToTab(tabId, msg);

//     return response;
//   } catch (error) {
//     console.log(error);
//     const response = { status: 'failed' };
//     return response;
//   }
// }

export async function switchTab(
  serializedState: SerializedTabState
): Promise<void> {
  debugger;
  if (serializedState.tabId === undefined) {
    debugger;
    console.warn('switchTab: Tab ID is undefined:', serializedState);
    return;
  }
  debugger;
  const storedTabs = await getAllStoredTabs();
  debugger;
  const matchesObject = storedTabs;
  debugger;
  const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));
  debugger;
  const currentTabIndex = tabIds.findIndex(
    (tabId) => tabId === serializedState.tabId
  );
  debugger;
  const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
  debugger;
  const nextTabId = tabIds[nextTabIndex];

  chrome.tabs.update(nextTabId, { active: true }, async (tab) => {
    if (tab === undefined || tab.id === undefined) return;

    serializedState.tabId = tab.id;

    const msg = createUpdateHighlightsMsg(tab.id);
    debugger;
    await sendMsgToTab<UpdateHighlightsMsg>(tab.id, msg);

    updateStore(store, {
      globalMatchIdx: store.tabStates[nextTabId].globalMatchIdxStart,
    });
  });
}

/**
 * Event Handling Functions
 */
// export async function handleGetAllMatchesMsg(findValue: string) {
//   resetPartialStore(store);
//   executeContentScriptOnAllTabs(findValue, store);
// }

// export async function handleNextPrevMatch(
//   sender: chrome.runtime.MessageSender,
//   type: string,
//   transactionId: TransactionId
// ) {
//   if (sender.tab && sender.tab.id) {
//     const response = await executeContentScriptWithMessage(
//       sender.tab.id,
//       type,
//       transactionId
//     );

//     if (response.transactionId !== transactionId) {
//       throw new Error(
//         'transactionId mismatch. transactionId: ' +
//           transactionId +
//           'response.transactionId: ' +
//           response.transactionId
//       );
//     }
//     const tabState = store.tabStates[sender.tab.id];

//     // let currentIndex = tabState.globalMatchIdxStart;

//     if (response.status === 'success') {
//       const currentIndex = response.serializedState2.currentIndex;

//       updateStore(store, {
//         globalMatchIdx: tabState.globalMatchIdxStart + currentIndex,
//         tabStates: {
//           ...store.tabStates,
//           [sender.tab.id]: {
//             ...tabState,
//             currentIndex,
//           },
//         },
//       });
//     } else {
//       // TODO: Review to see if you actually need this:
//       const currentIndex = tabState.globalMatchIdxStart;
//       updateStore(store, {
//         tabStates: {
//           ...store.tabStates,
//           [sender.tab.id]: {
//             ...tabState,
//             currentIndex,
//           },
//         },
//       });
//     }
//   }
// }

export async function handleToggleStylesAllTabs(
  addStyles: boolean
  // tabs?: chrome.tabs.Tab[]
) {
  // FIXME: you should be able to replace this message by injecting styles into the DOM
  const tabs = await queryCurrentWindowTabs();
  tabs.forEach(async (tab) => {
    const tabId: ValidTabId = tab.id as number;
    const payload = { store, tabId };
    const msg = createToggleStylesMsg(addStyles, payload);
    sendMsgToTab<ToggleStylesMsg>(tab.id, msg);
    // await sendMsgToTab<ToggleStylesMsg>(tab.id, msg);
  });
  // debugger;
  updateStore(store, {
    showLayover: addStyles,
    showMatches: addStyles,
  });
}

export async function handleRemoveAllHighlightMatches(sendResponse: Function) {
  const tabs = await queryCurrentWindowTabs();

  const tabPromises = tabs.map((tab) => {
    if (tab.id) {
      const msg = createRemoveAllHighlightMatchesMsg();
      return sendMsgToTab<RemoveAllHighlightMatchesMsg>(tab.id, msg);
    } else {
      return Promise.resolve(null);
    }
  });

  const responses = await Promise.all(tabPromises);
  sendResponse(responses);

  return true;
}

// FIXME: REFACTOR
export async function handleUpdateTabStatesObj(
  payload: any,
  sendResponse: Function
) {
  const { serializedState } = payload;
  // debugger;
  await setStoredTabs(serializedState);

  store.updatedTabsCount++;

  if (store.updatedTabsCount === store.totalTabs) {
    updateMatchesCount();
    store.updatedTabsCount = 0;
  }

  // updateStore(store, {
  //   tabStates: {
  //     ...store.tabStates,
  //     [payload.serializedState.tabId]: {
  //       ...store.tabStates[payload.serializedState.tabId],
  //       serializedMatches: payload.serializedState.serializedMatches,
  //     },
  //   },
  // });

  sendResponse({ status: 'success' });
}

export async function handleUpdateLayoverPosition(
  store: Store,
  newPosition: LayoverPosition
) {
  setStoredLayoverPosition(newPosition);

  updateStore(store, {
    layoverPosition: newPosition,
  });
}
