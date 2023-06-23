// src/background/store.ts

import { LayoverPosition } from '../types/Layover.types';
import { Store, TabStore, WindowStore } from '../types/Store.types';
import { SerializedTabState, ValidTabId } from '../types/tab.types';
import { queryCurrentWindowTabs } from './helpers/chromeAPI';
import { getAllStoredTabs } from './storage';

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

  const windowStores: { [K in number]: WindowStore } = {};
  let lastFocusedWindowId: chrome.windows.Window['id'] = -1;

  windows.forEach((window) => {
    if (window.id !== undefined) {
      windowStores[window.id] = initWindowStore();
      lastFocusedWindowId = window.id; // TODO: review
    }
  });

  return {
    lastFocusedWindowId,
    windowStores,
  };
}

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

// TODO: REPLACE PREVIOUS IMPLEMENTATION ONCE ALL CALLING INSTANCES ARE UPDATED
export function updateStoreNew(
  windowStore: WindowStore,
  updates: Partial<WindowStore>
): void {
  Object.assign(windowStore, updates);
}

// export function updateTabStore(windowStore, serializedTabState): void {
//   const { tabId } = serializedTabState;

//   windowStore.tabStores[tabId] ||= { tabId, serializedTabState };

//   Object.assign(windowStore.tabStores[tabId], {
//     tabId,
//     serializedTabState,
//   });

//   updateStoreNew(windowStore, { tabStores: windowStore.tabStores });
// }

export function updateTabStore(
  windowStore: WindowStore,
  newSerializedTabState: SerializedTabState
): void {
  const { tabId } = newSerializedTabState;

  windowStore.tabStores[tabId] = windowStore.tabStores[tabId] || {
    tabId,
    serializedTabState: {},
  };

  Object.assign(
    windowStore.tabStores[tabId].serializedTabState,
    newSerializedTabState
  );

  updateStoreNew(windowStore, { tabStores: windowStore.tabStores });
}

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
  const currentWindowTabs = await queryCurrentWindowTabs();

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

    return new Promise<boolean | Error>((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, msg, (response) => {
        if (chrome.runtime.lastError) {
          console.log(tabId);
          reject(chrome.runtime.lastError);
        } else {
          resolve(response as boolean);
        }
      });
    });
  });

  return Promise.all(promises);
}

export async function handleUpdateLayoverPosition(
  windowStore: WindowStore,
  newPosition: LayoverPosition
) {
  updateStore(windowStore, {
    layoverPosition: newPosition,
  });
}

export async function updateMatchesCount(windowStore: WindowStore) {
  const storedTabs = await getAllStoredTabs();

  let totalMatchesCount = 0;

  Object.keys(storedTabs).forEach((tabId) => {
    const validTabId = tabId as unknown as ValidTabId;
    totalMatchesCount += storedTabs[validTabId]?.matchesCount ?? 0;
  });

  updateStore(windowStore, {
    totalMatchesCount,
  });
}

export async function updateTotalTabsCount(windowStore: WindowStore) {
  const tabs = await queryCurrentWindowTabs();
  windowStore.totalTabs = tabs.length;
}
