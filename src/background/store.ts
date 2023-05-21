// src/background/store.ts

import { LayoverPosition } from '../components/Layover';
import { SerializedTabState, TabId, ValidTabId } from '../types/tab.types';
import { queryCurrentWindowTabs } from '../utils/backgroundUtils';

// Store Interface
export interface SharedStore {
  totalMatchesCount: number;
  layoverPosition: LayoverPosition;
  showLayover: boolean;
  showMatches: boolean;
  activeTabId: TabId;
  searchValue: string;

  // GLOBAL: yes - will need to review after logic changes to immediate searching
  lastSearchValue: string;
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
    activeTabId: undefined,
    totalMatchesCount: 0,
    searchValue: '',
    lastSearchValue: '',
    lastFocusedWindowId: undefined,
    updatedTabsCount: 0,
    totalTabs: undefined,
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
    searchValue: store.searchValue,
    lastSearchValue: store.lastSearchValue,
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
}

export function resetStore(store: Store): void {
  const initialState = initStore();
  updateStore(store, initialState);
}

export function resetPartialStore(store: Store): void {
  const partialInitialState = {
    totalMatchesCount: 0,
    searchValue: '',
    lastSearchValue: '',
    tabStates: {},
  };
  updateStore(store, partialInitialState);
}

export async function sendStoreToContentScripts(
  store: Store,
  tabIds: ValidTabId[] = []
): Promise<any> {
  const tabs = await queryCurrentWindowTabs();

  if (tabIds.length === 0) {
    tabIds = tabs
      .map((tab) => tab.id)
      .filter((id): id is ValidTabId => id !== undefined);
  }

  const promises = tabIds.map((tabId) => {
    const tabStore = createTabStore(store, tabId);
    const msg = {
      async: false,
      from: 'background:store',
      type: 'store-updated',
      payload: {
        tabId,
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
