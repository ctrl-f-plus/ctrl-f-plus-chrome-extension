// src/contentScripts/findMatchesScript.ts

import { serializeMatchesObj } from '../utils/htmlUtils';
import {
  findAllMatches,
  nextMatch,
  previousMatch,
  updateHighlights,
} from '../utils/matchUtils';

export interface TabState {
  tabId: chrome.tabs.Tab['id'] | undefined;
  // active?: boolean;
  currentIndex: number | undefined;
  matchesCount: number | undefined;
  // serializedMatches: string;
  // globalMatchIdxStart: number;
  // matchesObj: any[]; // FIXME: specify type
  // matchesObj: string[];
  //matchesObj: any[];
  matchesObj: string | any[]; // Change this line
}

const state2: TabState = {
  tabId: undefined,
  currentIndex: undefined,
  matchesCount: undefined,
  matchesObj: [] as string | any[],
  //matchesObj: [],
  //matchesObj: string | any[]; // Change this line
};

// console.log(new Date().toLocaleString());

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { from, type, findValue, tabId, tabState } = message;
  let serializedState2;

  switch (`${from}:${type}`) {
    case 'background:highlight':
      state2.tabId = message.tabId;

      await findAllMatches(state2, findValue);

      // TODO: DRY
      serializedState2 = { ...state2 };

      serializedState2.matchesObj = serializeMatchesObj(
        serializedState2.matchesObj
      );

      sendResponse({
        hasMatch: state2.matchesObj.length > 0,
        serializedState2: serializedState2,
      });

      return true;
    case 'background:next-match':
      if (state2.matchesObj.length > 0) await nextMatch(state2);

      // TODO: DRY
      serializedState2 = { ...state2 };
      serializedState2.matchesObj = serializeMatchesObj(
        serializedState2.matchesObj
      );

      sendResponse({
        serializedState2: serializedState2,
        status: 'success',
      });

      return true;
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
});
