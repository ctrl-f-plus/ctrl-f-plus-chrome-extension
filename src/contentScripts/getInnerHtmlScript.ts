// src/contentScripts/getInnerHtmlScript.ts

import { findAllMatches, nextMatch, previousMatch } from '../utils/matchUtils';
import contentStylesImport from './contentStyles';

(function () {
  if (window.myUniqueExtensionFlag) {
    console.log('Content script already injected. Exiting...');
    return;
  }

  // Set the unique flag to indicate that the content script has been injected
  window.myUniqueExtensionFlag = true;

  const state = {
    currentIndex: undefined,
    matches: undefined,
    matchesObj: {},
    tabId: undefined,
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { from, type } = message;

    console.log('Received message:', message, 'Message ID:', message.messageId);

    if (from === 'background' && type === 'highlight') {
      state.tabId = message.tabId;
      findAllMatches(state, message.findValue);
      return true;
    }

    if (message.type === 'get-all-matches-req') {
      return true;
    }

    if (message.type === 'next-match') {
      console.log('getInnerHtmlScript - next-match');

      if (state.matches.length > 0) {
        nextMatch(state);
        sendResponse({ hasMatch: true, tabId: state.tabId });
      } else {
        sendResponse({ hasMatch: false, tabId: state.tabId });
      }

      return true;
    }

    if (message.type === 'prev-match') {
      previousMatch(state);

      return true;
    }
  });
})();
