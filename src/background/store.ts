/* eslint-disable no-param-reassign */
// FIXME: remove this `eslint-disable` - maybe add a class?

// src/background/store.ts

import { Store, TabStore, WindowStore } from '../types/Store.types';
import { ValidTabId } from '../types/tab.types';
import { queryWindowTabs } from '../utils/chromeUtils';

export async function getAllOpenWindows(): Promise<chrome.windows.Window[]> {
  return new Promise((resolve, reject) => {
    chrome.windows.getAll({ populate: true }, (windows) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(windows);
      }
    });
  });
}

export function initWindowStore(): WindowStore {
  // windowId: chrome.windows.Window['id']
  const windowStore: WindowStore = {
    // SharedStore properties:
    totalMatchesCount: 0,
    layoverPosition: { x: 0, y: 0 },
    showLayover: false,
    showMatches: false,
    activeTabId: undefined,
    searchValue: '',
    lastSearchValue: '',

    // WindowStore specific properties:
    updatedTabsCount: 0,
    totalTabs: undefined,
    tabStores: {},
  };

  return windowStore;
}

export async function initStore(): Promise<Store> {
  const windows = await getAllOpenWindows();

  // const windowStores: Record<chrome.windows.Window['id'], WindowStore> = {};
  // let lastFocusedWindowId: chrome.windows.Window['id'] | undefined;

  const windowStores: { [K in number]: WindowStore } = {};
  let lastFocusedWindowId: chrome.windows.Window['id'] = -1; // initialize with a default value

  // for (const window of windows) {
  //   windowStores[window.id] = initWindowStore();
  //   lastFocusedWindowId = window.id; // TODO: review
  // }

  // windows.forEach((window) => {
  //   windowStores[window.id] = initWindowStore();
  //   lastFocusedWindowId = window.id; // TODO: review
  // });

  windows.forEach((window) => {
    if (window.id !== undefined) {
      // ensure the id is not undefined before using it
      windowStores[window.id] = initWindowStore();
      lastFocusedWindowId = window.id; // TODO: review
    }
  });

  return {
    lastFocusedWindowId,
    windowStores,
  };
}

// export function createTabStore(store: Store, tabId: ValidTabId): TabStore {
export function createTabStore(
  windowStore: WindowStore,
  tabId: ValidTabId
): TabStore {
  let serializedTabState = windowStore.tabStores[tabId]?.serializedTabState;

  if (serializedTabState === undefined) {
    serializedTabState = {
      tabId,
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
    totalMatchesCount: windowStore.totalMatchesCount,
    layoverPosition: windowStore.layoverPosition,
    showLayover: windowStore.showLayover,
    showMatches: windowStore.showMatches,
    searchValue: windowStore.searchValue,
    lastSearchValue: windowStore.lastSearchValue,
    activeTabId: windowStore.activeTabId,
  };
}

export function updateStore(
  windowStore: WindowStore,
  updates: Partial<WindowStore>
): void {
  Object.assign(windowStore, updates);

  const updatesTabStores = updates.tabStores;

  if (updatesTabStores) {
    // for (const tabId in updates.tabStores) {
    //   if (updates.tabStores.hasOwnProperty(tabId)) {
    //     if (!windowStore.tabStores[tabId]) {
    //       windowStore.tabStores[tabId] = updates.tabStores[tabId];
    //     } else {
    //       Object.assign(windowStore.tabStores[tabId], updates.tabStores[tabId]);
    //     }
    //   }
    // }
    Object.keys(updatesTabStores).forEach((tabId) => {
      const validTabId = tabId as unknown as ValidTabId;

      if (!windowStore.tabStores[validTabId]) {
        windowStore.tabStores[validTabId] = updatesTabStores[validTabId];
      } else {
        Object.assign(
          windowStore.tabStores[validTabId],
          updatesTabStores[validTabId]
        );
      }
    });
  }
}

// FIXME: Unused Function
// export function resetStore(store: Store): void {
//   const initialState = initStore();
//   updateStore(store, initialState);
// }

export function resetPartialStore(windowStore: WindowStore): void {
  const partialInitialState = {
    totalMatchesCount: 0,
    searchValue: '',
    lastSearchValue: '',
    tabStores: {},
  };
  updateStore(windowStore, partialInitialState);
}

export async function sendStoreToContentScripts(
  windowStore: WindowStore,
  tabIds: ValidTabId[] = []
): Promise<(boolean | Error)[]> {
  const currentWindowTabs = await queryWindowTabs();

  if (tabIds.length === 0) {
    tabIds = currentWindowTabs
      .map((tab) => tab.id)
      .filter((id): id is ValidTabId => id !== undefined);
  }

  const promises = tabIds.map((tabId) => {
    const tabStore = createTabStore(windowStore, tabId);
    const msg = {
      async: false,
      from: 'background:store',
      type: 'store-updated',
      payload: {
        tabId,
        tabStore,
      },
    };

    // return new Promise((resolve, reject) => {
    return new Promise<boolean | Error>((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, msg, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          // resolve(response);
          resolve(response as boolean);
        }
      });
    });
  });

  return Promise.all(promises);
}
