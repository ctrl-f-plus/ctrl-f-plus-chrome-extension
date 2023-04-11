// import { Messages } from '../utils/messages';
// import { GetInnerHtmlMessage } from '../utils/messages';

// // import {
// //   executeContentScriptOnAllTabs,
// //   executeContentScriptOnCurrentTab,
// //   navigateToNextTabWithMatch,
// //   navigateToPreviousTabWithMatch,
// // } from './queryTabs';
// // import { executeContentScriptWithMessage } from './executeContentScript';

// import {
//   executeContentScriptOnAllTabs,
//   executeContentScriptOnCurrentTab,
//   navigateToNextTabWithMatch,
//   navigateToPreviousTabWithMatch,
// } from './queryTabs';
// import { executeContentScriptWithMessage } from './executeContentScript';

// export const setupMessageListener = () => {
//   chrome.runtime.onMessage.addListener((message: Messages, sender) => {
//     if (
//       message.from === 'content' &&
//       message.type === 'get-inner-html' &&
//       message.payload
//     ) {
//       const { title, innerHtml } = message.payload;
//     }

//     if (
//       message.from === 'content' &&
//       message.type === 'execute-content-script'
//     ) {
//       const findValue = message.payload;
//       executeContentScriptOnAllTabs({ findValue: findValue });
//     } else if (
//       message.from === 'content' &&
//       (message.type === 'next-match' || message.type === 'previous-match')
//     ) {
//       executeContentScriptWithMessage({
//         tabId: sender.tab!.id,
//         messageType: message.type,
//         findValue: message.findValue,
//       });
//     }

//     if (message.type === 'highlight-matches') {
//       const findValue = message.findValue;
//       executeContentScriptOnCurrentTab({ findValue: findValue });
//     } else if (message.type === 'next-match') {
//       // TODO: Review - see if you can update so that it doesn't switch tabs every time.
//       navigateToNextTabWithMatch();
//     } else if (message.type === 'previous-match') {
//       navigateToPreviousTabWithMatch();
//     }
//   });
// };

// import { Messages } from '../utils/messages';
// import { GetInnerHtmlMessage } from '../utils/messages';

// import {
//   executeContentScriptOnAllTabs,
//   executeContentScriptOnCurrentTab,
//   navigateToNextTabWithMatch,
//   navigateToPreviousTabWithMatch,
//   executeContentScriptWithMessage,
// } from './queryTabs';
// // import {} from './executeContentScript';

// export const setupMessageListener = () => {
//   chrome.runtime.onMessage.addListener((message: Messages, sender) => {
//     if (
//       message.from === 'content' &&
//       message.type === 'get-inner-html' &&
//       message.payload
//     ) {
//       const { title, innerHtml } = message.payload;
//     }

//     if (
//       message.from === 'content' &&
//       message.type === 'execute-content-script'
//     ) {
//       const findValue = message.payload;
//       executeContentScriptOnAllTabs({ findValue: findValue });
//     } else if (message.from === 'content' && message.type === 'next-match') {
//       chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
//         chrome.tabs.query({}, (tabs) => {
//           const index = (tab.index + 1) % tabs.length;
//           chrome.tabs.update(tabs[index].id, { active: true });
//           chrome.tabs.sendMessage(tabs[index].id, {
//             type: 'tab-activated',
//             findValue: message.findValue,
//           });
//         });
//       });
//     } else if (
//       message.from === 'content' &&
//       message.type === 'previous-match'
//     ) {
//       executeContentScriptWithMessage({
//         tabId: sender.tab!.id,
//         messageType: message.type,
//         findValue: message.findValue,
//       });
//     }
//   });
// };

import { Messages } from '../utils/messages';
import { GetInnerHtmlMessage } from '../utils/messages';

import {
  executeContentScriptOnAllTabs,
  executeContentScriptOnCurrentTab,
  navigateToNextTabWithMatch,
  navigateToPreviousTabWithMatch,
} from './queryTabs';
import { executeContentScriptWithMessage } from './executeContentScript';

export const setupMessageListener = () => {
  chrome.runtime.onMessage.addListener((message: Messages, sender) => {
    if (
      message.from === 'content' &&
      message.type === 'get-inner-html' &&
      message.payload
    ) {
      const { title, innerHtml } = message.payload;
    }

    if (
      message.from === 'content' &&
      message.type === 'execute-content-script'
    ) {
      const findValue = message.payload;
      executeContentScriptOnAllTabs({ findValue: findValue });
    } else if (message.from === 'content' && message.type === 'next-match') {
      chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
        chrome.tabs.query({}, (tabs) => {
          const index = (tab.index + 1) % tabs.length;
          chrome.tabs.update(tabs[index].id, { active: true }, () => {
            chrome.scripting
              .executeScript({
                target: { tabId: tabs[index].id },
                files: ['static/js/contentScript.js'],
              })
              .then(() => {
                chrome.tabs.sendMessage(tabs[index].id, {
                  type: 'tab-activated',
                  findValue: message.findValue,
                });
              });
          });
        });
      });
    } else if (
      message.from === 'content' &&
      message.type === 'previous-match'
    ) {
      executeContentScriptWithMessage({
        tabId: sender.tab!.id,
        messageType: message.type,
        findValue: message.findValue,
      });
    }
  });
};
