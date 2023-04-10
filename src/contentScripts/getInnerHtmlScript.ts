// src/contentScripts/getInnerHtmlScript.ts
chrome.runtime.sendMessage({
  from: 'content',
  type: 'get-inner-html',
  // payload: document.body.innerHTML,
  payload: { title: document.title, innerHtml: document.body.innerHTML },
});

// const sendMessageToBackground = () => {
//   chrome.runtime.sendMessage({
//     from: 'content',
//     type: 'content',
//     payload: { title: document.title, innerHtml: document.body.innerHTML },
//   });
// };
