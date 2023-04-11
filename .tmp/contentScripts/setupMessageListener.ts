// src/contentScripts/highlighter.ts

import { findAllMatches, nextMatch, previousMatch } from './highlighter';
import { scrollToElement } from './scroll';

export const setupMessageListener = () => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Message received:', message);

    if (message.type === 'highlight') {
      // findAllMatches(message.findValue);
      findAllMatches({ findValue: message.findValue });
    } else if (message.type === 'next-match') {
      if (matches.length > 0) {
        nextMatch();
        sendResponse({ hasMatch: true });
      } else {
        sendResponse({ hasMatch: false });
      }
    } else if (message.type === 'previous-match') {
      previousMatch();
    }
  });
};
