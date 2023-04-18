// src/utils/storage.ts

// import { htmlToOuterHtml, outerHtmlToHtml } from './htmlUtils';
export function htmlToOuterHtml(matchesObj, tabId) {
  const matchesArray = matchesObj[tabId];

  const matchesObjOuterHtml = matchesArray
    ? matchesArray.map((el) => el.outerHTML)
    : [];

  return matchesObjOuterHtml;
}

export function outerHtmlToHtml(matchesObjOuterHtml) {
  const matchesObjElements: HTMLElement[] = matchesObjOuterHtml.map((el) => {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = el;
    return wrapper.firstChild as HTMLElement;
  });

  return matchesObjElements;
}

export interface Match {
  innerText: string;
  className: string;
  id: string;
}

export interface LocalStorage {
  findValue?: string;
  allMatches?: Match[];
  matchesObj?: { [tabId: number]: Match[] };
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

// TODO: See if you can figure out how many MBs are currently being used.
export async function getStoredMatchesObject(): Promise<{
  [tabId: number]: HTMLElement[];
}> {
  console.log(`getStoredMatchesObject()`);

  // Get all keys in local storage
  const allKeys = await new Promise<string[]>((resolve) => {
    chrome.storage.local.get(null, (items) => {
      resolve(Object.keys(items));
    });
  });

  // Filter the keys to only include those that start with 'matchesObjOuterHtml_'
  const outerHtmlKeys = allKeys.filter((key) =>
    key.startsWith('matchesObjOuterHtml_')
  );

  // Fetch the data for each key and map it to an object
  const matchesObj = await Promise.all(
    outerHtmlKeys.map(async (key) => {
      const tabId = parseInt(key.replace('matchesObjOuterHtml_', ''), 10);

      const matchesObjOuterHtml: string[] = await new Promise((resolve) => {
        chrome.storage.local.get(key, (res: LocalStorage) => {
          resolve(res[key] ?? []);
        });
      });

      const matchesObjElements = outerHtmlToHtml(matchesObjOuterHtml);

      const elements: HTMLElement[] = matchesObjOuterHtml.map((el) => {
        let wrapper = document.createElement('div');
        wrapper.innerHTML = el;
        return wrapper.firstChild as HTMLElement;
      });

      return { [tabId]: matchesObjElements };
    })
  );

  // Combine the individual objects into one object
  const combinedMatchesObj: { [tabId: number]: HTMLElement[] } = Object.assign(
    {},
    ...matchesObj
  );

  return combinedMatchesObj;
}

export function setStoredMatchesObject(
  matchesObj: {
    [tabId: number]: HTMLElement[];
  },
  tabId: number
): Promise<void> {
  const matchesObjOuterHtml = htmlToOuterHtml(matchesObj, tabId);

  const val: LocalStorage = {
    [`matchesObjOuterHtml_${tabId}`]: matchesObjOuterHtml,
  };

  return new Promise((resolve) => {
    chrome.storage.local.set(val, () => {
      resolve();
    });
  });
}

export async function clearStoredMatchesObject() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(null, (items) => {
      // Get all keys in local storage
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
