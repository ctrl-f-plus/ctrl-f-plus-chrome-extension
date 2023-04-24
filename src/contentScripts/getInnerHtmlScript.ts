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

  // console.log('Received message:', message, 'Message ID:', message.messageId);
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log("Rec'd msg:", message);
      const { from, type, findValue, tabId, messageId } = message;

      switch (`${from}:${type}`) {
        case 'background:highlight':
          state.tabId = message.tabId;
          await findAllMatches(state, message.findValue);
          sendResponse({
            hasMatch: state.matchesObj[state.tabId].length > 0,
            state: state,
          });
          return true;
        case 'background:next-match':
          if (state.matchesObj[state.tabId].length > 0) nextMatch(state);
          break;
        case 'background:prev-match':
          previousMatch(state);
          break;
        case 'background:update-highlights':
          updateHighlights(state, message.prevIndex);
          break;
        default:
          break;
      }

      return;
    }
  );
})();
