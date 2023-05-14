//@
// ts-nocheck
// src/background/store.ts

import _ from 'lodash';
import { LayoverPosition } from '../components/Layover';
import { SerializedTabState, ValidTabId } from '../types/tab.types';
import { createUpdateStoreMsg } from '../utils/messageUtils/createMessages';
import { sendMessageToContentScripts } from '../utils/messageUtils/sendMessageToContentScripts';

// Store Interface
export interface BaseStore {
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

export interface Store extends BaseStore {
  lastFocusedWindowId: chrome.windows.Window['id'] | undefined;
  updatedTabsCount: number;
  totalTabs: number | undefined;
  tabStates: Record<ValidTabId, SerializedTabState>;
}

export interface TabStore extends BaseStore {
  tabId: ValidTabId;
  serializedTabState: SerializedTabState;
}

// Store utility functions
// TODO: Add utility functions

// Store lifecycle functions
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
export function sendStoreToContentScripts(store: Store): void {
  const msg = createUpdateStoreMsg(store);
  sendMessageToContentScripts(msg);
}

//////////////////////////////////////////////
// Type guard to check if store is of type Store
function isStore(store: BaseStore): store is Store {
  // If the store has a 'tabStates' property, we know it's a Store
  return (store as Store).tabStates !== undefined;
}

// Type guard to check if store is of type TabStore
function isTabStore(store: BaseStore): store is TabStore {
  // If the store has a 'tabId' property, we know it's a TabStore
  return (store as TabStore).tabId !== undefined;
}

// TODO: Refactor
export function updateStore(
  store: Store | TabStore,
  updates: Partial<Store> | Partial<TabStore>
): void {
  // Check if the updates are actually different from the existing store
  // if (_.isEqual(store, { ...store, ...updates })) {
  //   return; // No updates needed, so return early
  // }

  // Merge the updates into the existing store
  Object.assign(store, updates);

  // If the store is a Store and it has tabStates updates
  if (isStore(store) && 'tabStates' in updates) {
    const storeUpdates = updates as Partial<Store>;

    if (storeUpdates.tabStates) {
      // Iterate over each tabState update
      for (const tabId in storeUpdates.tabStates) {
        if (store.tabStates[tabId]) {
          // If this tabState already exists, merge the updates into it
          Object.assign(store.tabStates[tabId], storeUpdates.tabStates[tabId]);
        } else {
          // If this tabState doesn't exist yet, create it
          store.tabStates[tabId] = storeUpdates.tabStates[tabId];
        }
      }
    }
  }

  // Prepare the message to send to the content scripts
  const msg = createUpdateStoreMsg(store as Store);

  // If the store is a Store, send the message to all tabs
  if (isStore(store)) {
    const tabIds = Object.keys(store.tabStates).map((key) => Number(key));
    console.log(store);
    // debugger;
    sendMessageToContentScripts(msg, tabIds);
  }
  // If the store is a TabStore, send the message to the specific tab
  else if (isTabStore(store)) {
    // debugger;
    sendMessageToContentScripts(msg, [store.tabId]);
  }
}

// export function updateStoreOLD(store: Store, updates: Partial<Store>): void {
//   Object.assign(store, updates);

//   if (updates.tabStates) {
//     for (const tabId in updates.tabStates) {
//       if (updates.tabStates.hasOwnProperty(tabId)) {
//         if (!store.tabStates[tabId]) {
//           store.tabStates[tabId] = updates.tabStates[tabId];
//         } else {
//           Object.assign(store.tabStates[tabId], updates.tabStates[tabId]);
//         }
//       }
//     }
//   }

//   const tabIds = Object.keys(store.tabStates).map((key) => Number(key));
//   const msg = createUpdateStoreMsg(store);
//   sendMessageToContentScripts(msg, tabIds);
// }
