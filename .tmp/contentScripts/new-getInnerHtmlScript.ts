// src/contentScripts/getInnerHtmlScript.ts

import { setupMessageListener } from './setupMessageListener';

chrome.runtime.sendMessage({
  from: 'content',
  type: 'get-inner-html',
  payload: { title: document.title, innerHtml: document.body.innerHTML },
});

setupMessageListener();
