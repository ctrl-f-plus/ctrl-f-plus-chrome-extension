// src/contentScripts/getInnerHtmlScript.ts

import {
  findAllMatches,
  nextMatch,
  previousMatch,
  updateHighlights,
} from '../utils/matchUtils';

(function () {
  if (window.myUniqueExtensionFlag) {
    console.log('Content script already injected. Exiting...');
    return;
  }

  // Set the unique flag to indicate that the content script has been injected
  window.myUniqueExtensionFlag = true;

  const state = {
    currentIndex: undefined,
    matchesObj: {},
    tabId: undefined,
  };

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      // console.log(
      //   'Received message:',
      //   message,
      //   'Message ID:',
      //   message.messageId
      // );

      const { from, type, findValue, tabId, messageId } = message;

      if (from === 'background' && type === 'highlight') {
        state.tabId = message.tabId;
        await findAllMatches(state, message.findValue);

        if (state.matchesObj[state.tabId].length > 0) {
          sendResponse({ hasMatch: true, state: state });
        } else {
          sendResponse({ hasMatch: false, state: state });
        }

        return true;
      }

      if (message.type === 'get-all-matches-req') {
        return;
      }

      if (message.type === 'next-match') {
        if (state.matchesObj[state.tabId].length > 0) {
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
        updateHighlights(state, message.prevIndex);
      }

      return true;
    }
  );
})();
