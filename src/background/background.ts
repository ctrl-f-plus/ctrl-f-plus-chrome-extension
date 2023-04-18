// src/background/background.ts

import { updateHighlights } from '../utils/matchUtils';
import {
  Messages,
  SwitchedActiveTabShowModal,
  UpdateHighlightsMessage,
} from '../utils/messages';
import { getStoredMatchesObject } from '../utils/storage';

// const allMatches: { [tabId: number]: HTMLElement[] } = {};
const tabStates: { [tabId: number]: any } = {};

(global as any).getStoredMatchesObject = getStoredMatchesObject;

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

    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ['getInnerHtmlScript.js'],
      },
      () => {
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
              // } else {
              //   tabStates[tab.id] = response.state;

              //   resolve(response);
              //   // resolve(response.hasMatch);
            } else {
              // Deserialize the matchesObj
              const deserializedMatchesObj = {};
              for (const key in response.serializedMatchesObj) {
                deserializedMatchesObj[key] = response.serializedMatchesObj[
                  key
                ].map((serializedEl) => {
                  const el = document.createElement('div');
                  el.innerText = serializedEl.innerText;
                  el.className = serializedEl.className;
                  el.id = serializedEl.id;
                  return el;
                });
              }

              // Update the state with deserializedMatchesObj
              response.state.matchesObj = deserializedMatchesObj;
              tabStates[tab.id] = response.state;
              resolve(response);
            }
          }
        );
      }
    );
  });
}

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
    if (tab.id) {
      const { hasMatch, state } = await executeContentScript(findValue, tab);

      console.log(hasMatch);
      console.log(foundFirstMatch);

      if (hasMatch && !foundFirstMatch) {
        foundFirstMatch = true;

        chrome.tabs.sendMessage(tab.id, {
          from: 'background',
          type: 'update-highlights',
          state: tabStates[tab.id],
          prevIndex: undefined, // or the previous index if needed
        });
      }
    }
  }
}

function executeContentScriptWithMessage(
  tabId: number,
  messageType: string,
  findValue: string
) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, {
        from: 'background',
        type: messageType,
        findValue,
        tabId,
      });
    }
  );
}

function navigateWithMatch(direction: 'next' | 'previous') {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    let activeTabIndex = tabs.findIndex((tab) => tab.active);
    let foundMatch = false;

    for (let i = 1; i <= tabs.length; i++) {
      let tabIndex =
        direction === 'next'
          ? (activeTabIndex + i) % tabs.length
          : (activeTabIndex - i + tabs.length) % tabs.length;
      let targetTab = tabs[tabIndex];

      if (targetTab.id) {
        chrome.tabs.sendMessage(
          targetTab.id,
          { type: `${direction}-match` },
          (response) => {
            if (chrome.runtime.lastError) {
              // Ignore this error
            } else if (response.hasMatch) {
              if (!foundMatch) {
                foundMatch = true;
                chrome.tabs.update(targetTab.id, { active: true });
              }
              return;
            }
          }
        );
      }
    }
  });
}

// function deserializeMatchesObj(serializedMatchesObj) {
//   const deserializedMatchesObj = {};

//   for (const key in serializedMatchesObj) {
//     deserializedMatchesObj[key] = serializedMatchesObj[key].map(
//       (serializedEl) => {
//         const el = document.createElement('div');
//         el.innerText = serializedEl.innerText;
//         el.className = serializedEl.className;
//         el.id = serializedEl.id;
//         return el;
//       }
//     );
//   }

//   return deserializedMatchesObj;
// }

async function switchTab(state, matchesObject) {
  //, prevIndex) {
  // if (state.tab.id === undefined) {
  //   console.warn('switchTab: Tab ID is undefined:', state.tab);
  //   return;
  // }
  const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));
  const currentTabIndex = tabIds.findIndex((tabId) => tabId === state.tabId);
  const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
  const nextTabId = tabIds[nextTabIndex];

  // state.matchesObj = tabStates[state.tabId].matchesObj[state.tabId][state.currentIndex];
  // TODO: YOU NEED TO DESERIALIZE THE TABSTATE

  chrome.tabs.update(nextTabId, { active: true }, async (tab) => {
    state.tabId = tab.id;
    // state.matchesObj[state.tabId][0].classList.add('ctrl-f-highlight-focus');
    if (
      state.matchesObj[state.tabId] &&
      state.matchesObj[state.tabId].length > 0
    ) {
      state.matchesObj[state.tabId][0].classList.add('ctrl-f-highlight-focus');
    }

    state.currentIndex = 0;
    const message: UpdateHighlightsMessage = {
      from: 'background',
      type: 'update-highlights',
      state: state,
      // prevIndex: prevIndex,
      prevIndex: undefined,
    };
    chrome.tabs.sendMessage(tab.id, message);

    const message2: SwitchedActiveTabShowModal = {
      from: 'background',
      type: 'switched-active-tab-show-modal',
    };
    console.log('Sending message:', message2);
    chrome.tabs.sendMessage(tab.id, message2);
  });
}

// TODO: decide if you need/want this on each if statement: `message.from === 'content' &&`
// TODO: Review - see if you can update so that it doesn't switch tabs every time.
chrome.runtime.onMessage.addListener(
  (message: Messages, sender, sendResponse) => {
    if (message.type === 'get-all-matches-req') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length) {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {
            from: 'background',
            type: 'get-all-matches-req',
          });
        }
      });

      return;
    }

    // Receive message from SearchInput component
    if (message.type === 'get-all-matches-msg') {
      const findValue = message.payload;

      executeContentScriptOnAllTabs(findValue);

      // TODO: START HERE! TODO: START HERE! TODO: START HERE! TODO: START HERE!
      // TODO: check if you need this `all-matches` message
      // TODO: THis might be a good place to save the matches to local storage
      // Sends Message back to SearchInput component
      // chrome.runtime.sendMessage({ type: 'all-matches', allMatches });

      return;
    }

    if (message.type === 'next-match' || message.type === 'prev-match') {
      console.log('background Script - next-match');

      // message.from,
      executeContentScriptWithMessage(
        sender.tab!.id,
        message.type,
        message.findValue
      );
      return;
    }

    // if (message.type === 'next-match') {
    //   // navigateToNextTabWithMatch();
    //   navigateWithMatch('next');
    // } else if (message.type === 'prev-match') {
    //   // navigateToPreviousTabWithMatch();
    //   navigateWithMatch('previous');
    // }

    if (message.type === 'remove-styles-all-tabs') {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'remove-styles' });
          }
        });
      });

      return;
    }

    if (message.type === 'add-styles-all-tabs') {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'add-styles' });
          }
        });
      });

      return;
    }

    if (message.type === 'remove-all-highlight-matches') {
      chrome.tabs.query({}, (tabs) => {
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
    }

    if (message.type === 'switch-tab') {
      switchTab(message.state, message.matchesObject);
      // , message.prevIndex);
      return;
    }

    if (message.type === 'update-tab-states-obj') {
      // debugger;
      // const { tabId, state, payload } = message.payload;
      const { tabId, state, serializedMatchesObj } = message.payload;

      tabStates[tabId] = state;
      tabStates[tabId].matchesObj = serializedMatchesObj;
      // tabStates[tabId] = state.serializedMatchesObj;

      // sendResponse({ status: 'success' });

      // const { tabId, state, payload, serializedMatchesObj } = message.payload;
      // const deserializedMatchesObj =
      //   deserializeMatchesObj(serializedMatchesObj);
      // tabStates[tabId] = state;
      // tabStates[tabId].matchesObj = deserializedMatchesObj;
      return;
    }
  }
);

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.sendMessage(tabId, {
    from: 'background',
    type: 'tab-activated',
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_search_overlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { command });
      }
    });
  }
});
