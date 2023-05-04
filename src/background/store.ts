// src/background/store.ts

import { TabState } from '../interfaces/tab.types';

export interface Store {
  globalMatchIdx: number;
  totalMatchesCount: number;
  findValue: string;
  lastFocusedWindowId: chrome.windows.Window['id'] | undefined;
  updatedTabsCount: number;
  totalTabs: number | undefined;
  activeTab: chrome.tabs.Tab | null;
  layoverPosition: { x: number; y: number };
  showLayover: boolean;
  showMatches: boolean;
  tabStates: {
    // [tabId: number]: {
    //   tabId: chrome.tabs.Tab['id'] | undefined;
    //   active: boolean;
    //   currentIndex: number;
    //   matchesCount: number;
    //   serializedMatches: string;
    //   globalMatchIdxStart: number;
    // };
    [tabId: number]: TabState;
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

  const tabIds = Object.keys(store.tabStates).map((key) => parseInt(key, 10));

  for (const tabId of tabIds) {
    const tabState = store.tabStates[tabId];
    // FIXME: the payload is redundant
    chrome.tabs.sendMessage(tabId, {
      from: 'store',
      type: 'store-updated',
      payload: {
        store,
        tabState,
      },
    });
  }
}

// store: The current store object, which holds the state of your application.
// updates: An object containing updates to the store. It has the same structure as the Store type, but its properties are optional, allowing you to update only the properties you need.
// The updateStore function updates the store object with the provided updates. Here's a breakdown of the code:

// Object.assign(store, updates);: This line uses Object.assign to merge the updates object into the store object. It mutates the store object, updating its properties with the corresponding properties from the updates object. If an update property doesn't exist in the store, it will be added.

// if (updates.tabStates) { ... }: This block checks if the updates object contains an updated version of the tabStates property. If it does, the block updates the tabStates in the store object.

// for (const tabId in updates.tabStates) { ... }: This loop iterates through each property in updates.tabStates, which represents the updated state for each tab. The loop variable tabId holds the current tab ID being processed.

// if (updates.tabStates.hasOwnProperty(tabId)) { ... }: This checks if the current tabId property is a direct property of updates.tabStates. It ensures that we only process properties owned by the updates.tabStates object and not any properties inherited from its prototype.

// if (!store.tabStates[tabId]) { ... }: This checks if the current tabId is not already present in the store.tabStates object. If it's not, then we add the new tab state to the store.tabStates object: store.tabStates[tabId] = updates.tabStates[tabId];.

// else { ... }: If the current tabId is already present in the store.tabStates object, then we need to update it with the new state. We do this using Object.assign(store.tabStates[tabId], updates.tabStates[tabId]);, which merges the updated tab state into the existing tab state, mutating the existing tab state in the process.

// This function updates the store object in-place with the provided updates. By updating the store object directly, the changes will be reflected in the outer scope where the store object was originally created, solving the issue you were experiencing.
