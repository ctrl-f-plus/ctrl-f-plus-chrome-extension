// src/utils/storage.ts

export interface Match {
  innerText: string;
  className: string;
  id: string;
}

export interface LayoverPosition {
  x: number;
  y: number;
}

// FIXME: review for duplicates
export interface StoredTab {
  tabId: number;
  currentIndex: number;
  matchesObj: Match[];
  matchesCount: number;
}

export interface LocalStorage {
  findValue?: string;
  allMatches?: Match[];
  matchesObj?: { [tabId: number]: Match[] };
  tabs?: { [tabId: number]: StoredTab };
  layoverPosition?: LayoverPosition;
}

export type LocalStorageKeys = keyof LocalStorage;
export type TabId = chrome.tabs.Tab['id'];

async function getLocalStorageItem<T extends LocalStorageKeys>(
  key: T
): Promise<LocalStorage[T]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (res: LocalStorage) => {
      resolve(res[key]);
    });
  });
}

async function setLocalStorageItem<T extends LocalStorageKeys>(
  key: T,
  value: LocalStorage[T]
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

// FIXME: S/b async await instead?
export function getStoredLayoverPosition(): Promise<LayoverPosition> {
  const key: LocalStorageKeys = 'layoverPosition';

  return getLocalStorageItem(key).then(
    (position) => position ?? { x: 0, y: 0 }
  );
}

export function setStoredLayoverPosition(
  newPosition: LayoverPosition
): Promise<void> {
  const key: LocalStorageKeys = 'layoverPosition';

  return setLocalStorageItem(key, newPosition);
}

export function getStoredFindValue(): Promise<string> {
  const key: LocalStorageKeys = 'findValue';

  return getLocalStorageItem(key).then((findValue) => findValue ?? '');
}

export function setStoredFindValue(findValue: string): Promise<void> {
  const key: LocalStorageKeys = 'findValue';

  return setLocalStorageItem(key, findValue);

  // const val: LocalStorage = { findValue };
  // return new Promise((resolve) => {
  //   chrome.storage.local.set(val, () => {
  //     resolve();
  //   });
  // });
}

export function getAllStoredTabs(): Promise<{ [tabId: number]: StoredTab }> {
  // const key: LocalStorageKeys[] = ['tabs'];

  // return new Promise((resolve, reject) => {
  //   chrome.storage.local.get(key, (res: LocalStorage) => {
  //     const tabs = res.tabs || {};
  //     resolve(tabs);
  //   });
  // });

  const key: LocalStorageKeys = 'tabs';
  return getLocalStorageItem('tabs').then((tabs) => tabs ?? {});
}

export function getStoredTab(tabId: TabId): Promise<StoredTab> {
  // const key: LocalStorageKeys[] = ['tabs'];

  // return new Promise((resolve, reject) => {
  //   if (!tabId) {
  //     reject(new Error('tabId not stored'));
  //     return;
  //   }

  //   chrome.storage.local.get(key, (res: LocalStorage) => {
  //     const tabs = res.tabs || {};
  //     resolve(tabs[tabId]);
  //   });
  // });

  const key: LocalStorageKeys = 'tabs';

  return getLocalStorageItem(key).then((tabs) => {
    if (!tabId || !tabs || !tabs[tabId]) {
      throw new Error('tabId not stored');
    }
    return tabs[tabId];
  });
}

export function setStoredTabs(serializedState2: any): Promise<void> {
  // const vals: LocalStorage = { tabs };
  // return new Promise((resolve, reject) => {
  // const { tabId, currentIndex, matchesObj, matchesCount } = serializedState2;

  //   if (
  //     !tabId ||
  //     typeof currentIndex === 'undefined' ||
  //     !matchesObj ||
  //     !matchesCount
  //   ) {
  //     reject(new Error('Invalid tab storage object'));
  //     return;
  //   }

  //   chrome.storage.local.get(['tabs'], (res) => {
  //     const currentData = res.tabs || {};

  //     currentData[tabId] = { tabId, currentIndex, matchesObj, matchesCount };

  //     chrome.storage.local.set({ tabs: currentData }, () => {
  //       resolve();
  //     });
  //   });
  // });

  const key: LocalStorageKeys = 'tabs';
  const { tabId, currentIndex, matchesObj, matchesCount } = serializedState2;

  if (!tabId || !matchesObj || !matchesCount) {
    throw new Error('Invalid tab storage object');
  }

  return getLocalStorageItem(key).then((currentData) => {
    const updatedData = { ...currentData, [tabId]: serializedState2 };
    return setLocalStorageItem(key, updatedData);
  });
}

export function clearLocalStorage() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}

export function clearStoredTab(tabId: TabId): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!tabId) {
      reject(new Error('tabId not provided'));
      return;
    }

    chrome.storage.local.get(['tabs'], (res) => {
      const currentData = res.tabs || {};
      if (currentData.hasOwnProperty(tabId)) {
        delete currentData[tabId];

        chrome.storage.local.set({ tabs: currentData }, () => {
          resolve();
        });
      } else {
        reject(new Error('tabId not found in storage'));
      }
    });
  });
}

export function clearAllStoredTabs(): Promise<void> {
  const key: LocalStorageKeys = 'tabs';

  return setLocalStorageItem(key, {});
}

export async function clearStoredMatchesObject() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(null, (items) => {
      const allKeys = Object.keys(items);

      // Filter the keys to only include those that start with 'matchesObjOuterHtml_'
      const matchesObjKeys = allKeys.filter((key) =>
        key.startsWith('matchesObjOuterHtml_')
      );

      // Remove the filtered keys from local storage
      chrome.storage.local.remove(matchesObjKeys, () => {
        resolve();
      });
    });
  });
}
