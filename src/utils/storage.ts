//@ts-nocheck
// src/utils/storage.ts
// TODO:Add window specific storage??

export interface Match {
  innerText: string;
  className: string;
  id: string;
}

export interface LocalStorage {
  findValue?: string;
  allMatches?: Match[];
  matchesObj?: { [tabId: number]: Match[] };
  tabs?: {};
}

export type LocalStorageKeys = keyof LocalStorage;

export function clearLocalStorage() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error while clearing local storage:',
          chrome.runtime.lastError
        );
      } else {
        console.log('Local storage cleared successfully');
      }
      resolve();
    });
  });
}

// export function getStoredSearchValue(): Promise<string> {
export function getStoredFindValue(): Promise<string> {
  console.log(`getStoredFindValue()`);
  const key: LocalStorageKeys[] = ['findValue'];
  // const key: LocalStorageKeys = 'searchValue';

  return new Promise((resolve) => {
    chrome.storage.local.get(key, (res: LocalStorage) => {
      resolve(res.findValue ?? '');
    });
  });
}

// export function setStoredSearchValue(searchValue: string): Promise<void> {
export function setStoredFindValue(findValue: string): Promise<void> {
  console.log(`setStoredFindValue()`);
  const val: LocalStorage = { findValue };

  return new Promise((resolve) => {
    chrome.storage.local.set(val, () => {
      resolve();
    });
  });
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
        if (chrome.runtime.lastError) {
          console.error(
            'Error while clearing local storage:',
            chrome.runtime.lastError
          );
        } else {
          console.log('Local storage for matchesObj cleared successfully');
        }
        resolve();
      });
    });
  });
}

export function getAllStoredTabs(): Promise<any> {
  // console.log(`setTabsStorage(${tabId})`);
  // const key[]: LocalStorage = ['tabs'];

  return new Promise((resolve, reject) => {
    // if (!tabId) {
    //   reject(new Error('tabId not stored'));
    //   return;
    // }

    chrome.storage.local.get(['tabs'], (res: LocalStorage) => {
      const tabs = res.tabs || {};
      resolve(tabs);
    });
  });
}

export function getStoredTab(tabId): Promise<any> {
  console.log(`getStoredTab(${tabId})`);
  // const key[]: LocalStorage = ['tabs'];

  return new Promise((resolve, reject) => {
    if (!tabId) {
      reject(new Error('tabId not stored'));
      return;
    }

    chrome.storage.local.get(['tabs'], (res: LocalStorage) => {
      // chrome.storage.local.get(key, (res: LocalStorage) => {
      const tabs = res.tabs || {};
      resolve(tabs[tabId]);
    });
  });
}

export function setStoredTabs(serializedState2: any): Promise<void> {
  console.log(`setStoredTabs(): `, serializedState2);
  // const vals: LocalStorage = { tabs };
  return new Promise((resolve, reject) => {
    const { tabId, currentIndex, matchesObj, matchesCount } = serializedState2;

    if (
      !tabId ||
      typeof currentIndex === 'undefined' ||
      !matchesObj ||
      !matchesCount
    ) {
      // debugger;
      reject(new Error('Invalid tab storage object'));
      return;
    }

    chrome.storage.local.get(['tabs'], (res) => {
      const currentData = res.tabs || {};

      currentData[tabId] = { tabId, currentIndex, matchesObj, matchesCount };

      chrome.storage.local.set({ tabs: currentData }, () => {
        resolve();
      });
    });
  });
}

export function clearStoredTab(tabId): Promise<void> {
  console.log(`clearStoredTabs(${tabId})`);

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
  console.log(`clearAllStoredTabs()`);

  return new Promise((resolve) => {
    chrome.storage.local.set({ tabs: {} }, () => {
      resolve();
    });
  });
}
