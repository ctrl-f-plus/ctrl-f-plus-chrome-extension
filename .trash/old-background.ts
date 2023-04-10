// // function printLocalStorage() {
// //   chrome.storage.local.get(null, (items) => {
// //     // if (Object.keys(items).length === 0) {
// //     //   return;
// //     // }

// //     console.log('All tab contents from local storage:');
// //     for (const tabId in items) {
// //       const curTabObj = items[tabId];
// //       console.log(
// //         `Tab ID: ${tabId}, Title: ${curTabObj.title}, Content: ${curTabObj.content}`
// //       );
// //     }
// //   });
// // }

// // function searchAndHighlight(tabId: number) {
// //   chrome.tabs.sendMessage(tabId, {
// //     type: 'highlight_word',
// //     word: 'Portfolio',
// //   });
// // }

// // chrome.commands.onCommand.addListener((command) => {
// //   if (command === 'print_local_storage') {
// //     // printLocalStorage();

// //     // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// //     chrome.tabs.query({ currentWindow: true }, (tabs) => {
// //       if (tabs[0]) {
// //         searchAndHighlight(tabs[0].id!);
// //       }
// //     });
// //   }
// // });

// // chrome.runtime.onMessage.addListener((message, sender) => {
// //   if (message.type === 'content') {
// //     if (sender.tab) {
// //       chrome.tabs.get(sender.tab.id, (tab) => {
// //         const tabId = tab.id.toString();
// //         chrome.storage.local.set(
// //           { [tabId]: { title: message.title, content: message.content } },
// //           () => {
// //             // TODO:REVIEW
// //             console.log(`Content from tab ${tabId} saved to local storage.`);
// //           }
// //         );
// //       });
// //     }
// //   }
// // });

// // chrome.tabs.query({ active: false, currentWindow: true }, (tabs) => {
// // chrome.tabs.query({ currentWindow: true }, (tabs) => {
// //   for (const tab of tabs) {
// //     // console.log(tab);
// //     chrome.scripting.executeScript(
// //       {
// //         target: { tabId: tab.id },
// //         files: ['contentScript.js'],
// //       },
// //       () => {
// //         if (chrome.runtime.lastError) {
// //           console.error(chrome.runtime.lastError.message);
// //         }
// //       }
// //     );
// //   }
// // });

// ########################################
// // start / src / background / background.ts;

// import { Messages, ExecuteContentScript } from '../utils/messages';

// function executeContentScript(tabId: number) {
//   chrome.scripting.executeScript({
//     target: { tabId: tabId },
//     files: ['contentScript.js'],
//   });

//   // chrome.runtime.onMessage.addListener((message: Messages, sender) => {
//   //   if (message.from === 'content' && message.type === 'content') {
//   //     console.log('Message received from content script:', message.payload);

//   //     // Send a message back to the content script
//   //     chrome.tabs.sendMessage(sender.tab!.id!, {
//   //       from: 'background',
//   //       type: 'example-message',
//   //       payload: 'Hello from background script',
//   //     });
//   //   }
//   // });
// }

// function executeContentScriptOnAllTabs() {
//   chrome.tabs.query({}, (tabs) => {
//     for (const tab of tabs) {
//       if (tab.id) {
//         executeContentScript(tab.id);
//       }
//     }
//   });
// }

// chrome.runtime.onMessage.addListener((message: Messages, sender) => {
//   if (message.from === 'content' && message.type === 'get-inner-html') {
//     console.log(`Tab ID: ${sender.tab!.id}, InnerHTML: ${message.payload}`);
//   }

//   if (message.from === 'content' && message.type === 'execute-content-script') {
//     executeContentScriptOnAllTabs();
//   }
// });

// // chrome.runtime.onMessage.addListener((message: Messages, sender) => {
// //   if (message.from === 'content' && message.type === 'content') {
// //     console.log('Message received from content script:', message.payload);

// //     // Send a message back to the content script
// //     chrome.tabs.sendMessage(sender.tab!.id!, {
// //       from: 'background',
// //       type: 'example-message',
// //       payload: 'Hello from background script',
// //     });
// //   }
// // });

// // chrome.runtime.onMessage.addListener((message: Messages, sender) => {
// //   if (message.from === 'content' && message.type === 'get-inner-html') {
// //     console.log(`Tab ID: ${sender.tab!.id}, InnerHTML: ${message.payload}`);
// //   }
// // });

// // chrome.commands.onCommand.addListener((command) => {
// //   if (command === 'print_local_storage') {
// //     chrome.tabs.query({ currentWindow: true }, (tabs) => {
// //       for (const tab of tabs) {
// //         // console.log(tab);
// //         executeContentScript(tab.id!);
// //         // searchAndHighlight(tab.id!);
// //       }
// //     });
// //   }
// // });

// // start/src/background/background.ts

// // start/src/background/background.ts
// // console.log('hello from background script');

// chrome.runtime.onInstalled.addListener(() => {
//   // TODO:
// });
