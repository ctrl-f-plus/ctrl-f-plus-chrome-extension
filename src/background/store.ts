// src/background/store.ts

import { LayoverPosition } from '../components/Layover';
import { SerializedTabState, ValidTabId, TabId } from '../types/tab.types';
import { queryCurrentWindowTabs } from '../utils/backgroundUtils';

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
  // activeTab: chrome.tabs.Tab | null;
  activeTabId: TabId;
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

export function initStore() {
  const store: Store = {
    // globalMatchIdx: 0,
    totalMatchesCount: 0,
    findValue: '',
    searchValue: '',
    lastSearchValue: '',
    lastFocusedWindowId: undefined,
    updatedTabsCount: 0,
    totalTabs: undefined,
    // activeTab: null,
    activeTabId: undefined,
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

    // globalMatchIdx: store.globalMatchIdx,
    // activeTab: store.activeTab,
    activeTabId: store.activeTabId,
  };
}

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

  console.log('store updated: ', store);
}

export function resetStore(store: Store): void {
  const initialState = initStore();
  updateStore(store, initialState);
}

export function resetPartialStore(store: Store): void {
  const partialInitialState = {
    totalMatchesCount: 0,
    findValue: '',
    searchValue: '',
    lastSearchValue: '',
    tabStates: {},
  };
  updateStore(store, partialInitialState);
}

// Store update functions
export async function sendStoreToContentScripts(store: Store): Promise<any> {
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
