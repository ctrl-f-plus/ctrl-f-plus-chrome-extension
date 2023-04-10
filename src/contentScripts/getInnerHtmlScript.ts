// src/contentScripts/getInnerHtmlScript.ts
chrome.runtime.sendMessage({
  from: 'content',
  type: 'get-inner-html',
  payload: document.body.innerHTML,
});
