// src/background/background.ts

import { Messages } from '../utils/messages';

// const allMatches: { [tabId: number]: HTMLElement[] } = {};

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
      });
    }
  );
}

// TODO: Add Settings option to allow the toggling of currentWindow to allow for the feature to work across multiple browser windows
function executeContentScriptOnAllTabs(findValue: string) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
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

// TODO: decide if you need/want this on each if statement: `message.from === 'content' &&`
// TODO: Review - see if you can update so that it doesn't switch tabs every time.
chrome.runtime.onMessage.addListener((message: Messages, sender) => {
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
    return true;
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

    return true;
  }

  if (message.type === 'add-styles-all-tabs') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'add-styles' });
        }
      });
    });

    return true;
  }
});

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
