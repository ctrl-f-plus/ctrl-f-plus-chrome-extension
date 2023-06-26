// src/utils/storage.ts

import { LayoverPosition } from '../../types/Layover.types';
import { SerializedTabState } from '../../types/tab.types';

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

export function getAllStoredTabs(): Promise<{
  [tabId: number]: SerializedTabState;
}> {
  return getLocalStorageItem('tabs').then((tabs) => tabs ?? {});
}

export async function setStoredTabs(
  serializedState: SerializedTabState
): Promise<void> {
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

export function clearAllStoredTabs(): Promise<void> {
  const key: LocalStorageKeys = 'tabs';

  return setLocalStorageItem(key, {});
}
