// src/utils/storage.ts

import { LayoverPosition } from '../types/Layover.types';
import { SerializedTabState, TabId } from '../types/tab.types';

export interface Match {
  innerText: string;
  className: string;
  id: string;
}

// FIXME: review for duplicates
export interface LocalStorage {
  searchValue?: string;
  lastSearchValue?: string;
  allMatches?: Match[];
  tabs?: { [tabId: number]: SerializedTabState };
  layoverPosition?: LayoverPosition;
}

export type LocalStorageKeys = keyof LocalStorage;

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

// export function getStoredStoredValue(): Promise<string> {
//   const key: LocalStorageKeys = 'findValue';

//   return getLocalStorageItem(key).then((findValue) => findValue ?? '');
// }

// export function setStoredFindValue(findValue: string): Promise<void> {
//   const key: LocalStorageKeys = 'findValue';

//   return setLocalStorageItem(key, findValue);

//   // const val: LocalStorage = { findValue };
//   // return new Promise((resolve) => {
//   //   chrome.storage.local.set(val, () => {
//   //     resolve();
//   //   });
//   // });
// }

/// ///////////////////////////////////////
export function getStoredLastSearchValue(): Promise<string> {
  const key: LocalStorageKeys = 'lastSearchValue';

  return getLocalStorageItem(key).then(
    (lastSearchValue) => lastSearchValue ?? ''
  );
}

export function setStoredLastSearchValue(
  lastSearchValue: string
): Promise<void> {
  const key: LocalStorageKeys = 'lastSearchValue';

  return setLocalStorageItem(key, lastSearchValue);
}

/// ///////////////////////////////////////

export function getAllStoredTabs(): Promise<{
  [tabId: number]: SerializedTabState;
}> {
  // const key: LocalStorageKeys[] = ['tabs'];

  // return new Promise((resolve, reject) => {
  //   chrome.storage.local.get(key, (res: LocalStorage) => {
  //     const tabs = res.tabs || {};
  //     resolve(tabs);
  //   });
  // });

  // const key: LocalStorageKeys = 'tabs';
  return getLocalStorageItem('tabs').then((tabs) => tabs ?? {});
}

export function getStoredTab(tabId: TabId): Promise<SerializedTabState> {
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

export async function setStoredTabs(
  serializedState: SerializedTabState
): Promise<void> {
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
  const { tabId, serializedMatches, matchesCount } = serializedState;

  if (!tabId || !serializedMatches || !matchesCount) {
    throw new Error('Invalid tab storage object');
  }

  const currentData = await getLocalStorageItem(key);
  const updatedData = { ...currentData, [tabId]: serializedState };
  return setLocalStorageItem(key, updatedData);
}

export function clearLocalStorage() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}

// export function clearStoredTab(tabId: TabId): Promise<void> {
//   return new Promise((resolve, reject) => {
//     if (!tabId) {
//       reject(new Error('tabId not provided'));
//       return;
//     }

//     chrome.storage.local.get(['tabs'], (res) => {
//       const currentData = res.tabs || {};
//       if (currentData.hasOwnProperty(tabId)) {
//         delete currentData[tabId];

//         chrome.storage.local.set({ tabs: currentData }, () => {
//           resolve();
//         });
//       } else {
//         reject(new Error('tabId not found in storage'));
//       }
//     });
//   });
// }

export function clearAllStoredTabs(): Promise<void> {
  const key: LocalStorageKeys = 'tabs';

  return setLocalStorageItem(key, {});
}

// export async function clearStoredMatchesObject() {
//   return new Promise<void>((resolve) => {
//     chrome.storage.local.get(null, (items) => {
//       const allKeys = Object.keys(items);

//       // Filter the keys to only include those that start with 'matchesObjOuterHtml_'
//       const matchesObjKeys = allKeys.filter((key) =>
//         key.startsWith('matchesObjOuterHtml_')
//       );

//       // Remove the filtered keys from local storage
//       chrome.storage.local.remove(matchesObjKeys, () => {
//         resolve();
//       });
//     });
//   });
// }
