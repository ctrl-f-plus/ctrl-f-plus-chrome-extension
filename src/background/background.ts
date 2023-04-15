// src/background/background.ts

import { Messages } from '../utils/messages';

// const allMatches: { [tabId: number]: HTMLElement[] } = {};

function executeContentScriptWithMessage(
  tabId: number,
  messageType: string,
  findValue: string
) {
  console.log('executeContentScriptWithMessage');
  console.log('executeContentScriptWithMessage - beg');
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tabId, { type: messageType, findValue, tabId });
    }
  );
  console.log('Sent some type of message');
  console.log('executeContentScriptWithMessage - end');
}

function executeContentScript(findValue: string, tab: chrome.tabs.Tab) {
  console.log('executeContentScript - beg');
  console.log(`${tab.id}`);
  // debugger;
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ['getInnerHtmlScript.js'],
    },
    () => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'highlight',
        findValue: findValue,
        tabId: tab.id,
        messageId: Date.now(),
      });
      console.log('Sent highlight message');
    }
  );
}

// TODO: Add Settings option to allow the toggling of currentWindow to allow for the feature to work across multiple browser windows
function executeContentScriptOnAllTabs(findValue: string) {
  console.log('executeContentScriptOnAllTabs - beg');
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      console.log('loop', tab.id);
      if (tab.id) {
        executeContentScript(findValue, tab);
      }
    });
  });

  // console.log('executeContentScriptOnAllTabs - end');
}

function navigateToNextTabWithMatch() {
  console.log('navigateToNextTabWithMatch()');
  // debugger;
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    let activeTabIndex = tabs.findIndex((tab) => tab.active);
    let foundMatch = false;

    for (let i = 1; i <= tabs.length; i++) {
      let nextTab = tabs[(activeTabIndex + i) % tabs.length];
      if (nextTab.id) {
        chrome.tabs.sendMessage(
          nextTab.id,
          { type: 'next-match' },
          (response) => {
            if (chrome.runtime.lastError) {
              // Ignore this error
            } else if (response.hasMatch) {
              if (!foundMatch) {
                foundMatch = true;
                if (response.tabId === nextTab.id) {
                  chrome.tabs.update(nextTab.id, { active: true });
                }
              }
              return;
            }
          }
        );
      }
    }
  });
}

function navigateToPreviousTabWithMatch() {
  console.log('navigateToPreviousTabWithMatch()');
  // debugger;
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    let activeTabIndex = tabs.findIndex((tab) => tab.active);
    let foundMatch = false;

    for (let i = 1; i <= tabs.length; i++) {
      let previousTab = tabs[(activeTabIndex - i + tabs.length) % tabs.length];
      if (previousTab.id) {
        chrome.tabs.sendMessage(
          previousTab.id,
          { type: 'prev-match' },
          (response) => {
            if (chrome.runtime.lastError) {
              // Ignore this error
            } else if (response.hasMatch) {
              if (!foundMatch) {
                foundMatch = true;
                chrome.tabs.update(previousTab.id, { active: true });
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
    console.log("background - rec'd `get-all-matches-req - beg");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { type: 'get-all-matches-req' });
      }
    });

    return;
  }

  if (message.type === 'get-inner-html' && message.payload) {
    console.log('get-inner-html - beg');
    const { tabId, title, matches } = message.payload;
    // allMatches[tabId] = matches;

    return;
  }

  // Receive message from SearchInput component
  if (message.type === 'get-all-matches-msg') {
    console.log("background - rec'd `get-all-matches-msg - beg");
    console.log("Handling 'get-all-matches-msg' message"); // Add this line
    const findValue = message.payload;

    executeContentScriptOnAllTabs(findValue);

    // TODO: START HERE! TODO: START HERE! TODO: START HERE! TODO: START HERE!
    // TODO: check if you need this `all-matches` message
    // TODO: THis might be a good place to save the matches to local storage
    // Sends Message back to SearchInput component
    // chrome.runtime.sendMessage({ type: 'all-matches', allMatches });
    // console.log("background - rec'd `get-all-matches-msg - end");
    return;
  }

  if (message.type === 'next-match' || message.type === 'prev-match') {
    console.log('nex-match - beg');
    executeContentScriptWithMessage(
      sender.tab!.id,
      message.type,
      message.findValue
    );
  }

  // if (message.type === 'next-match') {
  //   console.log('here2');
  //   navigateToNextTabWithMatch();
  // } else if (message.type === 'prev-match') {
  //   navigateToPreviousTabWithMatch();
  // }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  console.log('Activated tab:', tabId);
  chrome.tabs.sendMessage(tabId, { type: 'tab-activated' });
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
