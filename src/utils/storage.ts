// src/utils/storage.ts

export interface LocalStorage {
  // searchValue?: string;
  findValue?: string;
  matches?: string[];
}

export type LocalStorageKeys = keyof LocalStorage;

// export function getStoredSearchValue(): Promise<string> {
export function getStoredFindValue(): Promise<string> {
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
  const val: LocalStorage = { findValue };

  return new Promise((resolve) => {
    chrome.storage.local.set(val, () => {
      resolve();
    });
  });
}

// // Update lastActiveTabInfo
// setLastActiveTabInfo(updatedLastActiveTabInfo);

// // Get lastActiveTabInfo
// getLastActiveTabInfo().then((lastActiveTabInfo) => {
//   // Do something with lastActiveTabInfo
// });
