// src/background/background.ts

import {
  Messages,
  SwitchedActiveTabHideOverlay,
  SwitchedActiveTabShowOverlay,
  UpdateHighlightsMessage,
} from '../interfaces/message.types';
import { getAllStoredTabs, setStoredTabs } from '../utils/storage';

const tabStates: { [tabId: number]: any } = {};
let updatedTabsCount = 0;
let totalTabs = 0;

//////////////////////////////////
// async function initialize() {
//   await updateTotalTabsCount();
// }
// initialize();
//////////////////////////////////

updateTotalTabsCount();

// TODO:DRY these
function executeContentScript(
  findValue: string,
  tab: chrome.tabs.Tab
): Promise<{
  hasMatch: boolean;
  state: any;
}> {
  return new Promise<{ hasMatch: boolean; state: any }>((resolve, reject) => {
    if (tab.id === undefined) {
      console.warn('executeContentScript: Tab ID is undefined:', tab);
      reject({ hasMatch: false, state: null });
      return;
    }

    const tabId = tab.id as number;

    chrome.tabs.sendMessage(
      tabId,
      {
        from: 'background',
        type: 'highlight',
        findValue: findValue,
        tabId: tab.id,
        messageId: Date.now(),
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          reject({ hasMatch: false, state: null });
        } else {
          resolve(response);
        }
      }
    );
  });
}

// async function executeContentScriptOnAllTabs(findValue: string) {
//   const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
//     chrome.tabs.query({ currentWindow: true }, resolve);
//   });

//   const activeTabIndex = tabs.findIndex((tab) => tab.active);
//   const orderedTabs = [
//     ...tabs.slice(activeTabIndex),
//     ...tabs.slice(0, activeTabIndex),
//   ];

//   let foundFirstMatch = false;

//   for (const tab of orderedTabs) {
//     if (tab.id) {
//       const { hasMatch, state } = await executeContentScript(findValue, tab);

//       if (hasMatch && !foundFirstMatch) {
//         foundFirstMatch = true;

//         chrome.tabs.sendMessage(tab.id, {
//           from: 'background',
//           type: 'update-highlights',
//           state: tabStates[tab.id],
//           prevIndex: undefined,
//         });
//       }
//     }
//   }
// }

async function executeContentScriptOnAllTabs(findValue: string) {
  const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, resolve);
  });

  const activeTabIndex = tabs.findIndex((tab) => tab.active);
  const orderedTabs = [
    ...tabs.slice(activeTabIndex),
    ...tabs.slice(0, activeTabIndex),
  ];

  let foundFirstMatch = false;

  for (const tab of orderedTabs) {
    if (tab.id && !foundFirstMatch) {
      const { hasMatch, state } = await executeContentScript(findValue, tab);

      if (hasMatch && !foundFirstMatch) {
        foundFirstMatch = true;

        chrome.tabs.sendMessage(tab.id, {
          from: 'background',
          type: 'update-highlights',
          state: tabStates[tab.id],
          prevIndex: undefined,
        });

        // Process remaining tabs asynchronously
        const remainingTabs = orderedTabs.slice(orderedTabs.indexOf(tab) + 1);
        remainingTabs.forEach((remainingTab) => {
          if (remainingTab.id) {
            executeContentScript(findValue, remainingTab);
          }
        });

        break;
      }
    }
  }
}

function executeContentScriptWithMessage(tabId: number, messageType: string) {
  // ***2.5
  chrome.tabs.sendMessage(tabId, {
    from: 'background',
    type: messageType,
    tabId,
  });
}

async function switchTab(serializedState2) {
  //, prevIndex) {
  // if (serializedState2.tab.id === undefined) {
  //   console.warn('switchTab: Tab ID is undefined:', serializedState2.tab);
  //   return;
  // }

  // TODO: START HERE!! =>
  //    1) Clean this up (storedTabs vs matchesObject var naming)
  // //    2) Clean up all old references to matchesObj[tabId]
  //    3) Consolidate state/state2 naming convention into one name
  //    4) matchesObj isn't actually an object? check this and potentially update name
  const storedTabs = await getAllStoredTabs();
  const matchesObject = storedTabs;

  const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));
  const currentTabIndex = tabIds.findIndex(
    (tabId) => tabId === serializedState2.tabId
  );
  const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
  const nextTabId = tabIds[nextTabIndex];
  chrome.tabs.update(nextTabId, { active: true }, async (tab) => {
    serializedState2.tabId = tab.id;

    serializedState2.currentIndex = 0;
    const message: UpdateHighlightsMessage = {
      from: 'background',
      type: 'update-highlights',
      state: serializedState2,
      prevIndex: undefined,
    };
    chrome.tabs.sendMessage(tab.id, message);

    const message2: SwitchedActiveTabShowOverlay = {
      from: 'background',
      type: 'switched-active-tab-show-overlay',
    };
    chrome.tabs.sendMessage(tab.id, message2);
  });
}

// Utility function to rearrange the tabs
// function arrangeTabs(tabs: chrome.tabs.Tab[], activeTabId: number) {
// function arrangeTabs(tabIds: number[], activeTabId: number): number[] {
//   debugger;
//   const activeTabIndex = tabIds.indexOf(activeTabId);
//   const orderedTabIds = [
//     ...tabIds.slice(activeTabIndex + 1),
//     ...tabIds.slice(0, activeTabIndex),
//   ];
//   // return orderedTabs;
//   return orderedTabIds;
// }

async function getOrderedTabs(): Promise<chrome.tabs.Tab[]> {
  return new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const activeTabIndex = tabs.findIndex((tab) => tab.active);
      const orderedTabs = [
        ...tabs.slice(activeTabIndex + 1),
        ...tabs.slice(0, activeTabIndex),
      ];
      resolve(orderedTabs);
    });
  });
}

async function updateMatchesCount() {
  const storedTabs = await getAllStoredTabs();

  let totalMatchesCount = 0;
  for (const tabId in storedTabs) {
    if (storedTabs.hasOwnProperty(tabId)) {
      totalMatchesCount += storedTabs[tabId].matchesCount;
    }
  }
  const tabIds = Object.keys(storedTabs).map((key) => parseInt(key, 10));
  // debugger;
  for (const tabId of tabIds) {
    chrome.tabs.sendMessage(tabId, {
      from: 'background',
      type: 'update-matches-count',
      payload: {
        totalMatchesCount,
      },
    });
  }
}

// 'Match X/Y (Total: Z)';
async function updateTotalTabsCount() {
  totalTabs = await new Promise<number>((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => resolve(tabs.length));
  });
}

chrome.runtime.onMessage.addListener(
  async (message: Messages, sender, sendResponse) => {
    const { type, payload } = message;

    // Receive message from SearchInput component
    switch (type) {
      case 'get-all-matches-msg':
        const findValue = message.payload;
        executeContentScriptOnAllTabs(findValue);

        return;
      case 'next-match':
      case 'prev-match':
        // ***2
        executeContentScriptWithMessage(sender.tab.id, message.type);
        return;
      case 'remove-styles-all-tabs':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'remove-styles' });
            }
          });
        });

        return;
      case 'add-styles-all-tabs':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'add-styles' });
            }
          });
        });

        return;
      case 'remove-all-highlight-matches':
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          const tabPromises = tabs.map((tab) => {
            return new Promise((resolve) => {
              if (tab.id) {
                chrome.tabs.sendMessage(
                  tab.id,
                  {
                    type: 'remove-all-highlight-matches',
                  },
                  (response) => {
                    resolve(response);
                  }
                );
              } else {
                resolve(null);
              }
            });
          });

          Promise.all(tabPromises).then((responses) => {
            sendResponse(responses);
          });

          return true;
        });
        break;
      case 'switch-tab':
        switchTab(message.serializedState2);
        return;
      case 'update-tab-states-obj':
        const { serializedState2 } = message.payload;
        await setStoredTabs(serializedState2);

        updatedTabsCount++;
        debugger;
        if (updatedTabsCount === totalTabs) {
          debugger;
          updateMatchesCount();
          updatedTabsCount = 0; // Reset the count for future updates
        }

        sendResponse({ status: 'success' });
        return;
      default:
        break;
    }
  }
);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // TODO:(***101):This would be better if it only ran on stored tabs
  // const storedTabs = await getAllStoredTabs();
  // const matchesObject = storedTabs;
  // const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));

  // debugger;

  // const orderedTabs = arrangeTabs(tabs, tabId);
  // const orderedTabIds = arrangeTabs(tabIds, tabId);
  // TODO:(***101): Here
  const orderedTabs = await getOrderedTabs();

  // chrome.tabs.sendMessage(tabId, {
  //   from: 'background',
  //   type: 'tab-activated',
  // });

  const message1: SwitchedActiveTabShowOverlay = {
    from: 'background',
    type: 'switched-active-tab-show-overlay',
  };
  chrome.tabs.sendMessage(tabId, message1);

  const inactiveTabs = orderedTabs.filter((tab) => tab.id !== tabId);

  for (const otherTab of inactiveTabs) {
    if (otherTab.id) {
      const message2: SwitchedActiveTabHideOverlay = {
        from: 'background',
        type: 'switched-active-tab-hide-overlay',
      };
      chrome.tabs.sendMessage(otherTab.id, message2);
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  // TODO:REVIEW `active:currentWindow: true` below:
  // chrome.tabs.query({}, (tabs) => {
  if (command === 'toggle_search_overlay') {
    // chrome.tabs.query({ active:currentWindow: true }, (tabs) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { command });
      }
    });
  }
});

// chrome.tabs.onCreated.addListener(updateTotalTabsCount);
chrome.tabs.onCreated.addListener(() => {
  updateTotalTabsCount();
});

// chrome.tabs.onRemoved.addListener(updateTotalTabsCount);
chrome.tabs.onRemoved.addListener(() => {
  updateTotalTabsCount();
});
