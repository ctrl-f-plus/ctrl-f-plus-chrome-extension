////////////////////////////////////////////////////////////////////////////////
// ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE **
// ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE **
// // src/utils/storage.ts

// // import { htmlToOuterHtml, outerHtmlToHtml } from './htmlUtils';
// export function htmlToOuterHtml(matchesObj, tabId) {
//   const matchesArray = matchesObj[tabId];

//   const matchesObjOuterHtml = matchesArray
//     ? matchesArray.map((el) => el.outerHTML)
//     : [];

//   return matchesObjOuterHtml;
// }

// export function outerHtmlToHtml(matchesObjOuterHtml) {
//   const matchesObjElements: HTMLElement[] = matchesObjOuterHtml.map((el) => {
//     let wrapper = document.createElement('div');
//     wrapper.innerHTML = el;
//     return wrapper.firstChild as HTMLElement;
//   });

//   return matchesObjElements;
// }

// export interface Match {
//   innerText: string;
//   className: string;
//   id: string;
// }

// export interface LocalStorage {
//   findValue?: string;
//   allMatches?: Match[];
//   matchesObj?: { [tabId: number]: Match[] };
// }

// export type LocalStorageKeys = keyof LocalStorage;

// export function clearLocalStorage() {
//   return new Promise<void>((resolve) => {
//     chrome.storage.local.clear(() => {
//       if (chrome.runtime.lastError) {
//         console.error(
//           'Error while clearing local storage:',
//           chrome.runtime.lastError
//         );
//       } else {
//         console.log('Local storage cleared successfully');
//       }
//       resolve();
//     });
//   });
// }

// // export function getStoredSearchValue(): Promise<string> {
// export function getStoredFindValue(): Promise<string> {
//   console.log(`getStoredFindValue()`);
//   const key: LocalStorageKeys[] = ['findValue'];
//   // const key: LocalStorageKeys = 'searchValue';

//   return new Promise((resolve) => {
//     chrome.storage.local.get(key, (res: LocalStorage) => {
//       resolve(res.findValue ?? '');
//     });
//   });
// }

// // export function setStoredSearchValue(searchValue: string): Promise<void> {
// export function setStoredFindValue(findValue: string): Promise<void> {
//   console.log(`setStoredFindValue()`);
//   const val: LocalStorage = { findValue };

//   return new Promise((resolve) => {
//     chrome.storage.local.set(val, () => {
//       resolve();
//     });
//   });
// }

// // TODO: See if you can figure out how many MBs are currently being used.
// export async function getStoredMatchesObject(): Promise<{
//   [tabId: number]: HTMLElement[];
// }> {
//   console.log(`getStoredMatchesObject()`);

//   // Get all keys in local storage
//   const allKeys = await new Promise<string[]>((resolve) => {
//     chrome.storage.local.get(null, (items) => {
//       resolve(Object.keys(items));
//     });
//   });

//   // Filter the keys to only include those that start with 'matchesObjOuterHtml_'
//   const outerHtmlKeys = allKeys.filter((key) =>
//     key.startsWith('matchesObjOuterHtml_')
//   );

//   // Fetch the data for each key and map it to an object
//   const matchesObj = await Promise.all(
//     outerHtmlKeys.map(async (key) => {
//       const tabId = parseInt(key.replace('matchesObjOuterHtml_', ''), 10);

//       const matchesObjOuterHtml: string[] = await new Promise((resolve) => {
//         chrome.storage.local.get(key, (res: LocalStorage) => {
//           resolve(res[key] ?? []);
//         });
//       });

//       const matchesObjElements = outerHtmlToHtml(matchesObjOuterHtml);

//       const elements: HTMLElement[] = matchesObjOuterHtml.map((el) => {
//         let wrapper = document.createElement('div');
//         wrapper.innerHTML = el;
//         return wrapper.firstChild as HTMLElement;
//       });

//       return { [tabId]: matchesObjElements };
//     })
//   );

//   // Combine the individual objects into one object
//   const combinedMatchesObj: { [tabId: number]: HTMLElement[] } = Object.assign(
//     {},
//     ...matchesObj
//   );

//   return combinedMatchesObj;
// }

// export function setStoredMatchesObject(
//   matchesObj: {
//     [tabId: number]: HTMLElement[];
//   },
//   tabId: number
// ): Promise<void> {
//   const matchesObjOuterHtml = htmlToOuterHtml(matchesObj, tabId);

//   const val: LocalStorage = {
//     [`matchesObjOuterHtml_${tabId}`]: matchesObjOuterHtml,
//   };

//   return new Promise((resolve) => {
//     chrome.storage.local.set(val, () => {
//       resolve();
//     });
//   });
// }

// export async function clearStoredMatchesObject() {
//   return new Promise<void>((resolve) => {
//     chrome.storage.local.get(null, (items) => {
//       // Get all keys in local storage
//       const allKeys = Object.keys(items);

//       // Filter the keys to only include those that start with 'matchesObjOuterHtml_'
//       const matchesObjKeys = allKeys.filter((key) =>
//         key.startsWith('matchesObjOuterHtml_')
//       );

//       // Remove the filtered keys from local storage
//       chrome.storage.local.remove(matchesObjKeys, () => {
//         if (chrome.runtime.lastError) {
//           console.error(
//             'Error while clearing local storage:',
//             chrome.runtime.lastError
//           );
//         } else {
//           console.log('Local storage for matchesObj cleared successfully');
//         }
//         resolve();
//       });
//     });
//   });
// }

// ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE **
// ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE ** NEW STORAGE **
////////////////////////////////////////////////////////////////////////////////
// // src/utils/storage.ts

// export interface Match {
//   innerText: string;
//   className: string;
//   id: string;
// }

// export interface LocalStorage {
//   // searchValue?: string;
//   findValue?: string;
//   allMatches?: Match[];
//   matchesObj?: {
//     [tabId: number]: HTMLElement[];
//   };
//   matchesObjOuterHtml?;
// }

// export type LocalStorageKeys = keyof LocalStorage;

// export function clearLocalStorage() {
//   return new Promise<void>((resolve) => {
//     chrome.storage.local.clear(() => {
//       if (chrome.runtime.lastError) {
//         console.error(
//           'Error while clearing local storage:',
//           chrome.runtime.lastError
//         );
//       } else {
//         console.log('Local storage cleared successfully');
//       }
//       resolve();
//     });
//   });
// }

// // export function getStoredSearchValue(): Promise<string> {
// export function getStoredFindValue(): Promise<string> {
//   console.log(`getStoredFindValue()`);
//   const key: LocalStorageKeys[] = ['findValue'];
//   // const key: LocalStorageKeys = 'searchValue';

//   return new Promise((resolve) => {
//     chrome.storage.local.get(key, (res: LocalStorage) => {
//       resolve(res.findValue ?? '');
//     });
//   });
// }

// // export function setStoredSearchValue(searchValue: string): Promise<void> {
// export function setStoredFindValue(findValue: string): Promise<void> {
//   console.log(`setStoredFindValue()`);
//   const val: LocalStorage = { findValue };

//   return new Promise((resolve) => {
//     chrome.storage.local.set(val, () => {
//       resolve();
//     });
//   });
// }

// export function getStoredAllMatches(): Promise<Match[]> {
//   console.log(`getStoredAllMatches()`);
//   const keys: LocalStorageKeys[] = ['allMatches'];

//   return new Promise((resolve) => {
//     chrome.storage.local.get(keys, (res: LocalStorage) => {
//       resolve(res.allMatches ?? []);
//     });
//   });
// }

// export function setStoredAllMatches(allMatches: Match[]): Promise<void> {
//   console.log(`setStoredAllMatches`);
//   // const vals: LocalStorage = { allMatches };
//   const vals: LocalStorage = { allMatches };

//   console.log('TESTING!');
//   return new Promise((resolve) => {
//     chrome.storage.local.set(vals, () => {
//       resolve();
//     });
//   });
// }

// ///////////////////////////////////

// async function fetchMatchesObjOuterHtml(): Promise<{
//   [tabId: number]: string[];
// }> {
//   return new Promise((resolve) => {
//     chrome.storage.local.get('matchesObjOuterHtml', (res: LocalStorage) => {
//       resolve(res.matchesObjOuterHtml ?? []);
//     });
//   });
// }

// function objectFromEntries<T>(
//   entries: ReadonlyArray<readonly [key: number, value: T]>
// ): { [key: number]: T } {
//   const result: { [key: number]: T } = {};
//   for (const [key, value] of entries) {
//     result[key] = value;
//   }
//   return result;
// }

// export async function getStoredMatchesObject(): Promise<
//   { [tabId: number]: HTMLElement[] } | undefined
// > {
//   console.log(`getStoredMatchesObject()`);

//   const storedMatchesObject = await fetchMatchesObjOuterHtml();

//   const matchesObjOuterHtml: { [tabId: number]: HTMLElement[] } =
//     objectFromEntries(
//       Object.entries(storedMatchesObject).map(([tabId, outerHtmlArray]) => {
//         const matchesObj = outerHtmlArray
//           ? outerHtmlArray.map((el) => {
//               let wrapper = document.createElement('div');
//               wrapper.innerHTML = el;
//               return wrapper.firstChild as HTMLElement;
//             })
//           : [];

//         return [parseInt(tabId, 10), matchesObj];
//       })
//     );
//   return matchesObjOuterHtml;
// }

// function outerHtmlArrayToElements(outerHtmlArray: string[]): HTMLElement[] {
//   return outerHtmlArray.map((el) => {
//     let wrapper = document.createElement('div');
//     wrapper.innerHTML = el;
//     return wrapper.firstChild as HTMLElement;
//   });
// }

// export async function setStoredMatchesObject(
//   matchesObj: {
//     [tabId: number]: HTMLElement[];
//   },
//   tabId: number
// ): Promise<void> {
//   console.log(`setStoredMatchesObject()`);
//   return new Promise(async (resolve) => {
//     const storedMatchesObject = await fetchMatchesObjOuterHtml();
//     const matchesArray = matchesObj[tabId];
//     storedMatchesObject[tabId] = matchesArray
//       ? matchesArray.map((el) => el.outerHTML)
//       : [];
//     const val = { matchesObjOuterHtml: storedMatchesObject };
//     chrome.storage.local.set(val, () => {
//       if (chrome.runtime.lastError) {
//         console.error(
//           'Error while setting stored matches object:',
//           chrome.runtime.lastError
//         );
//       }
//       resolve();
//     });
//   });
// }

// src/utils/storage.ts

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

////////////////////////////////////////////////////////
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

      const elements: HTMLElement[] = matchesObjOuterHtml.map((el) => {
        let wrapper = document.createElement('div');
        wrapper.innerHTML = el;
        return wrapper.firstChild as HTMLElement;
      });

      return { [tabId]: elements };
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
  console.log(`setStoredMatchesObject()`);
  const matchesArray = matchesObj[tabId];
  const matchesObjOuterHtml = matchesArray
    ? matchesArray.map((el) => el.outerHTML)
    : [];

  // Use a dynamic key based on the tabId
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

export function getStoredTab(tabId): Promise<any> {
  console.log(`setTabsStorage(${tabId})`);
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

export function setStoredTabs(state2: any): Promise<void> {
  console.log(`setTabsStorage()`);
  // const vals: LocalStorage = { tabs };
  return new Promise((resolve, reject) => {
    const { tabId, currentIndex, matchesObj } = state2;

    if (!tabId || typeof currentIndex === 'undefined' || !matchesObj) {
      reject(new Error('Invalid tab storage object'));
      return;
    }

    chrome.storage.local.get(['tabs'], (res) => {
      const currentData = res.tabs || {};

      currentData[tabId] = { tabId, currentIndex, matchesObj };

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
