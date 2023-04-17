// src/contentScripts/getInnerHtmlScript.ts

import {
  findAllMatches,
  nextMatch,
  previousMatch,
  updateHighlights,
} from '../utils/matchUtils';
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
    // matches: undefined,
    matchesObj: {},
    tabId: undefined,
  };

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log('Received message- inner:', message);
      const { from, type } = message;

      console.log(
        'Received message:',
        message,
        'Message ID:',
        message.messageId
      );

      if (from === 'background' && type === 'highlight') {
        state.tabId = message.tabId;
        await findAllMatches(state, message.findValue, message.firstMatchFound);
        return true;
      }

      if (message.type === 'get-all-matches-req') {
        return;
      }

      if (message.type === 'next-match') {
        // debugger;
        console.log('getInnerHtmlScript - next-match');

        // if (state.matches.length > 0) {
        if (state.matchesObj[state.tabId].length > 0) {
          // debugger;
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

      if (message.type === 'update-highlights') {
        updateHighlights(message.state, message.prevIndex);
      }
    }
  );
})();
