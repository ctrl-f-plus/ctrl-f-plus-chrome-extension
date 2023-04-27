// src/contentScripts/getInnerHtmlScript.ts

import { serializeMatchesObj } from '../utils/htmlUtils';
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

  // const state = {
  //   currentIndex: undefined,
  //   matchesObj: {},
  //   tabId: undefined,
  // };

  const state2 = {
    currentIndex: undefined,
    matchesObj: [] as string | any[],
    tabId: undefined,
  };

  console.log(new Date().toLocaleString());

  // console.log('Received message:', message, 'Message ID:', message.messageId);
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log("Rec'd msg:", message);

      const { from, type, findValue, tabId, messageId } = message;

      switch (`${from}:${type}`) {
        case 'background:highlight':
          state2.tabId = message.tabId;

          await findAllMatches(state2, findValue);

          // TODO: DRY
          const serializedState2 = { ...state2 };

          serializedState2.matchesObj = serializeMatchesObj(
            serializedState2.matchesObj
          );

          sendResponse({
            hasMatch: state2.matchesObj.length > 0,
            serializedState2: serializedState2,
          });

          return true;
        case 'background:next-match':
          if (state2.matchesObj.length > 0) nextMatch(state2);
          break;
        case 'background:prev-match':
          previousMatch(state2);
          break;
        case 'background:update-highlights':
          updateHighlights(state2, message.prevIndex);
          break;
        default:
          break;
      }

      return;
    }
  );
})();
