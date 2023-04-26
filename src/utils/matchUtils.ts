// src/utils/matchUtils.ts
import { searchAndHighlight } from './searchAndHighlightUtils';
import { serializeMatchesObj } from '../utils/htmlUtils';

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
      // setStoredMatchesObject(state.matchesObj, state.tabId);

      // const state2 = { ...state };
      // state2.matchesObj = state2.matchesObj[state2.tabId];
      // state2.matchesObj = serializeMatchesObj(state2.matchesObj);

      const serializedState2 = { ...state };

      serializedState2.matchesObj =
        serializedState2.matchesObj[serializedState2.tabId];

      serializedState2.matchesObj = serializeMatchesObj(
        serializedState2.matchesObj
      );

      // FIXME: REVIEW this message
      chrome.runtime.sendMessage(
        {
          from: 'content',
          type: 'update-tab-states-obj',
          payload: {
            hasMatch: state.matchesObj[state.tabId].length > 0,
            state,
            tabId: state.tabId,
            serializedState2,
          },
        },
        function (response) {}
      );
      console.log(state.matchesObj);
    },
  });
}

export function updateHighlights(
  state2,
  prevIndex?: number,
  endOfTab?: boolean
) {
  debugger;
  if (state2.matchesObj[state2.tabId]) {
    state2.matchesObj = state2.matchesObj[state2.tabId];
  }

  if (!state2.matchesObj.length) {
    return;
  }

  if (typeof prevIndex === 'number') {
    const prevMatch = state2.matchesObj[prevIndex];
    prevMatch.classList.remove('ctrl-f-highlight-focus');
  }

  if (endOfTab) {
    return;
  }

  const curMatch = state2.matchesObj[state2.currentIndex];
  curMatch.classList.add('ctrl-f-highlight-focus');
  scrollToElement(curMatch);
}

export async function nextMatch(state) {
  debugger;
  // ***5
  console.log('getInnerHtmlScript - nextMatch()');
  const prevIndex = state.currentIndex;

  // TODO: send message to update tabStates?

  state.currentIndex =
    // (state.currentIndex + 1) % state.matchesObj[state.tabId].length;
    (state.currentIndex + 1) % state.matchesObj.length;
  debugger;
  // TODO: DRY
  const state2 = { ...state };
  // state2.matchesObj = state2.matchesObj[state2.tabId];

  if (state.currentIndex === 0) {
    const endOfTab: boolean = true;

    debugger;
    updateHighlights(state2, prevIndex, endOfTab);
    state2.matchesObj = serializeMatchesObj(state2.matchesObj);

    // TODO:(*99) Fix this so that `switch-tab` is only run when the targetTab != currentTab
    const message = {
      type: 'switch-tab',
      state: state2,
      // matchesObject: strg,
      prevIndex: undefined,
    };
    chrome.runtime.sendMessage(message);
    // KEEP AND TEST STORAGE HERE: debugger;
    // state.matchesObj[state.tabId] = outerHtmlToHtml(
    //   state.matchesObj[state.tabId]
    // );
    // KEEP AND TEST STORAGE HERE: debugger;
  } else {
    debugger;
    updateHighlights(state2, prevIndex);
  }
}

export function previousMatch(state) {
  const prevIndex = state.currentIndex;
  state.currentIndex =
    (state.currentIndex - 1 + state.matchesObj[state.tabId].length) %
    state.matchesObj[state.tabId].length;

  debugger;
  updateHighlights(state, prevIndex);
}

function scrollToElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
