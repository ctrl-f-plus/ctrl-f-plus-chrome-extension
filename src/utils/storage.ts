// src/utils/storage.ts

export interface Match {
  innerText: string;
  className: string;
  id: string;
}

export interface LocalStorage {
  // searchValue?: string;
  findValue?: string;
  allMatches?: Match[];
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

export function getStoredAllMatches(): Promise<Match[]> {
  const keys: LocalStorageKeys[] = ['allMatches'];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.allMatches ?? []);
    });
  });
}

export function setStoredAllMatches(allMatches: Match[]): Promise<void> {
  // const vals: LocalStorage = { allMatches };
  const vals: LocalStorage = { allMatches };

  console.log('TESTING!');
  // debugger;
  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
}
