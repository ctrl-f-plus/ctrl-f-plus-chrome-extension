// src/utils/matchUtils.ts
import { htmlToOuterHtml, outerHtmlToHtml } from './htmlUtils';
import { searchAndHighlight } from './searchAndHighlightUtils';
import { getStoredMatchesObject, setStoredMatchesObject } from './storage';

export async function findAllMatches(state, findValue) {
  state.matchesObj = {};
  state.currentIndex = 0;

  searchAndHighlight({
    currentIndex: state.currentIndex,
    matches: state.matches,
    matchesObj: state.matchesObj,
    findValue,
    tabId: state.tabId,
    callback: async () => {
      const serializedMatchesObj = {};

      for (const tabId in state.matchesObj) {
        serializedMatchesObj[tabId] = htmlToOuterHtml(state.matchesObj, tabId);
      }

      // TODO: START HERE ^^
      debugger;
      const strg = await getStoredMatchesObject();
      debugger;
      setStoredMatchesObject(state.matchesObj, state.tabId);

      // FIXME: REVIEW: Call this right after the state has been updated with the matches
      chrome.runtime.sendMessage(
        {
          from: 'content',
          type: 'update-tab-states-obj',
          payload: {
            hasMatch: state.matchesObj[state.tabId].length > 0,
            state,
            serializedMatchesObj,
            tabId: state.tabId,
          },
        },
        function (response) {}
      );
      console.log(state.matchesObj);
    },
  });
}

export function updateHighlights(
  state,
  prevIndex?: number,
  endOfTab?: boolean
) {
  if (!state.matchesObj[state.tabId].length) {
    return;
  }

  if (typeof prevIndex === 'number') {
    const prevMatch = state.matchesObj[state.tabId][prevIndex];
    prevMatch.classList.remove('ctrl-f-highlight-focus');
  }

  if (endOfTab) {
    return;
  }
  debugger;
  const curMatch = state.matchesObj[state.tabId][state.currentIndex];
  debugger;
  curMatch.classList.add('ctrl-f-highlight-focus');
  debugger;
  scrollToElement(curMatch);
}

export async function nextMatch(state) {
  console.log('getInnerHtmlScript - nextMatch()');
  const prevIndex = state.currentIndex;

  // TODO: send message to update tabStates?

  state.currentIndex =
    (state.currentIndex + 1) % state.matchesObj[state.tabId].length;

  if (state.currentIndex === 0) {
    const endOfTab: boolean = true;

    updateHighlights(state, prevIndex, endOfTab);

    // state.matchesObj[state.tabId] = htmlToOuterHtml(
    //   state.matchesObj,
    //   state.tabId
    // );
    debugger;
    const strg = await getStoredMatchesObject();
    debugger;
    const message = {
      type: 'switch-tab',
      state: state,
      matchesObject: strg,
      prevIndex: undefined,
    };
    chrome.runtime.sendMessage(message);
    debugger;
    // state.matchesObj[state.tabId] = outerHtmlToHtml(
    //   state.matchesObj[state.tabId]
    // );
    debugger;
  } else {
    debugger;
    updateHighlights(state, prevIndex);
  }
}

export function previousMatch(state) {
  const prevIndex = state.currentIndex;
  state.currentIndex =
    (state.currentIndex - 1 + state.matchesObj[state.tabId].length) %
    state.matchesObj[state.tabId].length;

  updateHighlights(state, prevIndex);
}

function scrollToElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
