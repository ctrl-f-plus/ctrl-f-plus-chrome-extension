// src/background/background.ts

import {
  Messages,
  SwitchedActiveTabShowModal,
  UpdateHighlightsMessage,
} from '../utils/messages';
import { getStoredMatchesObject } from '../utils/storage';

// const allMatches: { [tabId: number]: HTMLElement[] } = {};

(global as any).getStoredMatchesObject = getStoredMatchesObject;

// (global as any).setStoredMatchesObject = setStoredMatchesObject({}, );
// src/background/background.ts

let firstMatchFound = false;

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

function executeContentScript(findValue: string, tab: chrome.tabs.Tab) {
  if (tab.id === undefined) {
    console.warn('executeContentScript: Tab ID is undefined:', tab);
    return;
  }

  const tabId = tab.id as number;

  chrome.scripting.executeScript(
    {
      target: { tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, {
        from: 'background',
        type: 'highlight',
        findValue: findValue,
        tabId: tab.id,
        messageId: Date.now(),
        firstMatchFound: firstMatchFound,
      });

      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
      }

      if (!firstMatchFound) {
        firstMatchFound = true;
      }
    }
  );
}

// TODO: Add Settings option to allow the toggling of currentWindow to allow for the feature to work across multiple browser windows
function executeContentScriptOnAllTabs(findValue: string) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    firstMatchFound = false;

    tabs.forEach((tab) => {
      if (tab.id) {
        executeContentScript(findValue, tab);
      }
    });
  });
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

async function switchTab(state, matchesObject, prevIndex) {
  const tabIds = Object.keys(matchesObject).map((key) => parseInt(key, 10));
  const currentTabIndex = tabIds.findIndex((tabId) => tabId === state.tabId);
  const nextTabIndex = (currentTabIndex + 1) % tabIds.length;
  const nextTabId = tabIds[nextTabIndex];

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
      prevIndex: prevIndex,
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
      switchTab(message.state, message.matchesObject, message.prevIndex);
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
