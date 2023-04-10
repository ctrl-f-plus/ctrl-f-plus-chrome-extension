// start / src / background / background.ts;

// import { Messages } from '../utils/messages';
import { Messages, ExecuteContentScript } from '../utils/messages';

function executeContentScript(tabId: number) {
  // console.log(tabId);
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    // files: ['contentScript.js'],
    files: ['contentScript.js'],
  });

  // chrome.runtime.onMessage.addListener((message: Messages, sender) => {
  //   if (message.from === 'content' && message.type === 'content') {
  //     console.log('Message received from content script:', message.payload);

  //     // Send a message back to the content script
  //     chrome.tabs.sendMessage(sender.tab!.id!, {
  //       from: 'background',
  //       type: 'example-message',
  //       payload: 'Hello from background script',
  //     });
  //   }
  // });
}

function executeContentScriptOnAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        executeContentScript(tab.id);
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message: Messages, sender) => {
  if (message.from === 'content' && message.type === 'get-inner-html') {
    console.log(`Tab ID: ${sender.tab!.id}, InnerHTML: ${message.payload}`);
  }

  if (message.from === 'content' && message.type === 'execute-content-script') {
    // if (sender.tab?.id) {
    //   executeContentScript(sender.tab.id);
    // }
    executeContentScriptOnAllTabs();
  }
});

// chrome.runtime.onMessage.addListener((message: Messages, sender) => {
//   if (message.from === 'content' && message.type === 'content') {
//     console.log('Message received from content script:', message.payload);

//     // Send a message back to the content script
//     chrome.tabs.sendMessage(sender.tab!.id!, {
//       from: 'background',
//       type: 'example-message',
//       payload: 'Hello from background script',
//     });
//   }
// });

// chrome.runtime.onMessage.addListener((message: Messages, sender) => {
//   if (message.from === 'content' && message.type === 'get-inner-html') {
//     console.log(`Tab ID: ${sender.tab!.id}, InnerHTML: ${message.payload}`);
//   }
// });

// chrome.commands.onCommand.addListener((command) => {
//   if (command === 'print_local_storage') {
//     chrome.tabs.query({ currentWindow: true }, (tabs) => {
//       for (const tab of tabs) {
//         // console.log(tab);
//         executeContentScript(tab.id!);
//         // searchAndHighlight(tab.id!);
//       }
//     });
//   }
// });

// start/src/background/background.ts

// start/src/background/background.ts
// console.log('hello from background script');

chrome.runtime.onInstalled.addListener(() => {
  // TODO:
});
