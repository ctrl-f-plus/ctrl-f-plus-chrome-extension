// src/background/store.ts

import { LayoverPosition } from '../components/Layover';
import { SerializedTabState, ValidTabId } from '../types/tab.types';
import { createUpdateStoreMsg } from '../utils/messageUtils/createMessages';
import { sendMessageToContentScripts } from '../utils/messageUtils/sendMessageToContentScripts';

// Store Interface
export interface Store {
  globalMatchIdx: number;
  totalMatchesCount: number;
  findValue: string;
  searchValue: string;
  lastSearchValue: string;
  lastFocusedWindowId: chrome.windows.Window['id'] | undefined;
  updatedTabsCount: number;
  totalTabs: number | undefined;
  activeTab: chrome.tabs.Tab | null;
  layoverPosition: LayoverPosition;
  showLayover: boolean;
  showMatches: boolean;
  tabStates: Record<ValidTabId, SerializedTabState>;
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
export function updateStore(store: Store, updates: Partial<Store>): void {
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

  
  const tabIds = Object.keys(store.tabStates).map((key) => Number(key));
  const msg = createUpdateStoreMsg(store);
  sendMessageToContentScripts(msg, tabIds);
}

export function sendStoreToContentScripts(store: Store): void {
  const msg = createUpdateStoreMsg(store);
  sendMessageToContentScripts(msg);
}
