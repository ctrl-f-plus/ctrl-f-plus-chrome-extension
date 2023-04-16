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

  function injectStyles(css) {
    const style = document.createElement('style');

    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    return style;
  }

  function removeStyles(styleElement) {
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  }

  const injectedStyle = injectStyles(contentStylesImport);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { from, type } = message;

    console.log('Received message:', message, 'Message ID:', message.messageId);

    if (from === 'background' && type === 'highlight') {
      state.tabId = message.tabId;
      findAllMatches(state, message.findValue);
      return;
    }

    if (message.type === 'get-all-matches-req') {
      return;
    }

    if (message.type === 'next-match') {
      console.log('getInnerHtmlScript - next-match');

      if (state.matches.length > 0) {
        nextMatch(state);
        sendResponse({ hasMatch: true, tabId: state.tabId });
      } else {
        sendResponse({ hasMatch: false, tabId: state.tabId });
      }

      return;
    }

    if (message.type === 'prev-match') {
      previousMatch(state);

      return;
    }

    if (message.type === 'remove_styles') {
      // TODO: TRY TO GET THE STYLES TO TOGGLE WITH THE SEARCH MODAL

      removeStyles(injectedStyle);
      return;
    }
  });
})();
