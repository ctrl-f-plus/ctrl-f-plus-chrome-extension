// src/background/store.ts

import _ from 'lodash'; // FIXME: remove lodash package if you don't end up using it
import { LayoverPosition } from '../components/Layover';
import { UpdateStoreMsg } from '../types/message.types';
import { SerializedTabState, ValidTabId } from '../types/tab.types';
import { queryCurrentWindowTabs } from '../utils/backgroundUtils';
import { createUpdateStoreMsg } from '../utils/messageUtils/createMessages';
import {
  sendMessageToContentScripts,
  sendMessageToTab,
  sendMsgToTab,
} from '../utils/messageUtils/sendMessageToContentScripts';

// Store Interface
export interface SharedStore {
  totalMatchesCount: number;
  layoverPosition: LayoverPosition;
  showLayover: boolean;
  showMatches: boolean;

  // GLOBAL: yes - will need to review after logic changes
  findValue: string;
  searchValue: string;
  lastSearchValue: string;

  // GLOBAL: MAYBE, OTHERWISE MORE TO `Store`
  globalMatchIdx: number;
  activeTab: chrome.tabs.Tab | null;
}

export interface Store extends SharedStore {
  lastFocusedWindowId: chrome.windows.Window['id'] | undefined;
  updatedTabsCount: number;
  totalTabs: number | undefined;
  tabStates: Record<ValidTabId, SerializedTabState>;
}

export interface TabStore extends SharedStore {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}

// tabId: TabId;
// active?: boolean;
// currentIndex: number | undefined;
// matchesCount: number | undefined;
// globalMatchIdxStart?: number;
// serializedMatches: JSONString;

// const sharedStore: SharedStore = initSharedStore();

// // Store utility functions
// // TODO: Add utility functions

// // Store lifecycle functions
// export function initSharedStore(): SharedStore {
//   return {
//     totalMatchesCount: 0,
//     layoverPosition: { x: 0, y: 0 },
//     showLayover: false,
//     showMatches: false,
//     findValue: '',
//     searchValue: '',
//     lastSearchValue: '',
//     globalMatchIdx: 0,
//     activeTab: null,
//   };
// }

// // Initialize Store
// export function initStore(): Store {
//   return {
//     ...sharedStore,
//     lastFocusedWindowId: undefined,
//     updatedTabsCount: 0,
//     totalTabs: undefined,
//     tabStates: {},
//   };
// }

// // Initialize TabStore
// export function initTabStore(
//   tabId: ValidTabId,
//   serializedTabState: SerializedTabState
// ): TabStore {
//   return {
//     ...sharedStore,
//     tabId,
//     serializedTabState,
//   };
// }

// export interface Store {
//   globalMatchIdx: number;
//   totalMatchesCount: number;
//   findValue: string;
//   searchValue: string;
//   lastSearchValue: string;
//   lastFocusedWindowId: chrome.windows.Window['id'] | undefined;
//   updatedTabsCount: number;
//   totalTabs: number | undefined;
//   activeTab: chrome.tabs.Tab | null;
//   layoverPosition: LayoverPosition;
//   showLayover: boolean;
//   showMatches: boolean;
//   tabStates: Record<ValidTabId, SerializedTabState>;
// }

export function initStore() {
  const store: Store = {
    globalMatchIdx: 0,
    totalMatchesCount: 0,
    findValue: '',
    searchValue: '',
    lastSearchValue: '',
    lastFocusedWindowId: undefined,
    updatedTabsCount: 0,
    totalTabs: undefined,
    activeTab: null,
    layoverPosition: { x: 0, y: 0 },
    showLayover: false,
    showMatches: false,
    tabStates: {},
  };
  return store;
}

export function createTabStore(store: Store, tabId: ValidTabId): TabStore {
  let serializedTabState = store.tabStates[tabId];
  if (serializedTabState === undefined) {
    serializedTabState = {
      tabId: tabId,
      // active: false,
      currentIndex: 0,
      matchesCount: 0,
      // matchesObj: [],
      serializedMatches: '',
      globalMatchIdxStart: -1,
    };
  }

  return {
    tabId,
    serializedTabState,

    // SHARED STORE:
    totalMatchesCount: store.totalMatchesCount,
    layoverPosition: store.layoverPosition,
    showLayover: store.showLayover,
    showMatches: store.showMatches,

    findValue: store.findValue,
    searchValue: store.searchValue,
    lastSearchValue: store.lastSearchValue,

    globalMatchIdx: store.globalMatchIdx,
    activeTab: store.activeTab,
  };
}

export function updateStore(store: Store, updates: Partial<Store>): void {
  // if (Object.keys(updates).length === 1 && Object.keys)
  Object.assign(store, updates);

  if (updates.tabStates) {
    for (const tabId in updates.tabStates) {
      if (updates.tabStates.hasOwnProperty(tabId)) {
        if (!store.tabStates[tabId]) {
          store.tabStates[tabId] = updates.tabStates[tabId];
        } else {
          Object.assign(store.tabStates[tabId], updates.tabStates[tabId]);
        }
      }
    }
  }

  console.log('store updated: ', store);
  // const tabIds = Object.keys(store.tabStates).map((key) => Number(key));
  // const msg = createUpdateStoreMsg(store);
  // sendMessageToContentScripts(msg, tabIds);

  // sendStoreToContentScripts(store);
}

export function resetStore(store: Store): void {
  const initialState = initStore();
  updateStore(store, initialState);
}

export function resetPartialStore(store: Store): void {
  const partialInitialState = {
    globalMatchIdx: 0,
    totalMatchesCount: 0,
    findValue: '',
    searchValue: '',
    lastSearchValue: '',
  };
  updateStore(store, partialInitialState);
}

// Store update functions
export async function sendStoreToContentScripts(store: Store): Promise<any> {
  // const msg = createUpdateStoreMsg(store);
  // sendMessageToContentScripts(msg);

  const tabs = await queryCurrentWindowTabs();
  const tabIds = tabs
    .map((tab) => tab.id)
    .filter((id): id is ValidTabId => id !== undefined);

  const promises = tabIds.map((tabId) => {
    const tabStore = createTabStore(store, tabId);
    const msg = {
      async: false,
      from: 'background:store',
      type: 'store-updated',
      payload: {
        tabStore,
      },
    };
    // console.log(tabStore);
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, msg, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  });

  return Promise.all(promises);
}
