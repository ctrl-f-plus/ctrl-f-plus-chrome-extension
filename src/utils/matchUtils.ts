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

      // KEEP AND TEST STORAGE HERE: debugger;
      const strg = await getStoredMatchesObject();
      // KEEP AND TEST STORAGE HERE: debugger;
      setStoredMatchesObject(state.matchesObj, state.tabId);

      // FIXME: REVIE this message
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

  const curMatch = state.matchesObj[state.tabId][state.currentIndex];
  curMatch.classList.add('ctrl-f-highlight-focus');
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
    // KEEP AND TEST STORAGE HERE: debugger;
    const strg = await getStoredMatchesObject();
    // KEEP AND TEST STORAGE HERE: debugger;
    const message = {
      type: 'switch-tab',
      state: state,
      matchesObject: strg,
      prevIndex: undefined,
    };
    chrome.runtime.sendMessage(message);
    // KEEP AND TEST STORAGE HERE: debugger;
    // state.matchesObj[state.tabId] = outerHtmlToHtml(
    //   state.matchesObj[state.tabId]
    // );
    // KEEP AND TEST STORAGE HERE: debugger;
  } else {
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
