// function printLocalStorage() {
//   chrome.storage.local.get(null, (items) => {
//     // if (Object.keys(items).length === 0) {
//     //   return;
//     // }

//     console.log('All tab contents from local storage:');
//     for (const tabId in items) {
//       const curTabObj = items[tabId];
//       console.log(
//         `Tab ID: ${tabId}, Title: ${curTabObj.title}, Content: ${curTabObj.content}`
//       );
//     }
//   });
// }

// function searchAndHighlight(tabId: number) {
//   chrome.tabs.sendMessage(tabId, {
//     type: 'highlight_word',
//     word: 'Portfolio',
//   });
// }

// chrome.commands.onCommand.addListener((command) => {
//   if (command === 'print_local_storage') {
//     // printLocalStorage();

//     // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.tabs.query({ currentWindow: true }, (tabs) => {
//       if (tabs[0]) {
//         searchAndHighlight(tabs[0].id!);
//       }
//     });
//   }
// });

// chrome.runtime.onMessage.addListener((message, sender) => {
//   if (message.type === 'content') {
//     if (sender.tab) {
//       chrome.tabs.get(sender.tab.id, (tab) => {
//         const tabId = tab.id.toString();
//         chrome.storage.local.set(
//           { [tabId]: { title: message.title, content: message.content } },
//           () => {
//             // TODO:REVIEW
//             console.log(`Content from tab ${tabId} saved to local storage.`);
//           }
//         );
//       });
//     }
//   }
// });

// chrome.tabs.query({ active: false, currentWindow: true }, (tabs) => {
// chrome.tabs.query({ currentWindow: true }, (tabs) => {
//   for (const tab of tabs) {
//     // console.log(tab);
//     chrome.scripting.executeScript(
//       {
//         target: { tabId: tab.id },
//         files: ['contentScript.js'],
//       },
//       () => {
//         if (chrome.runtime.lastError) {
//           console.error(chrome.runtime.lastError.message);
//         }
//       }
//     );
//   }
// });
