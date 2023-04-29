// src/background/store.ts

export interface Store {
  globalMatchIdx: number;
  totalMatchesCount: number;
  findValue: string;
  lastFocusedWindowId: chrome.windows.Window['id'] | undefined;
  updatedTabsCount: number;
  totalTabs: number | undefined;
  activeTab: chrome.tabs.Tab | null;
  overlayPosition: { x: number; y: number };
  showOverlay: boolean;
  showMatches: boolean;
  tabStates: {
    [tabId: number]: {
      tabId: chrome.tabs.Tab['id'] | undefined;
      active: boolean;
      currentIndex: number;
      matchesCount: number;
      serializedMatches: string;
    };
  };
}

export function initStore() {
  const store: Store = {
    globalMatchIdx: 0,
    totalMatchesCount: 0,
    findValue: '',
    lastFocusedWindowId: undefined,
    updatedTabsCount: 0,
    totalTabs: undefined,
    activeTab: null,
    overlayPosition: { x: 0, y: 0 },
    showOverlay: false,
    showMatches: false,
    tabStates: {},
  };

  return store;
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
