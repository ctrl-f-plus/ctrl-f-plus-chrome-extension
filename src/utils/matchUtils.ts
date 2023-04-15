// src/utils/matchUtils.ts
import { searchAndHighlight } from './searchAndHighlightUtils';

export function findAllMatches(state, findValue) {
  state.matches = [];
  state.currentIndex = 0;

  searchAndHighlight({
    currentIndex: state.currentIndex,
    matches: state.matches,
    matchesObj: state.matchesObj,
    findValue,
    tabId: state.tabId,
    callback: () => {
      // TODO: only update highlights on the active tab/on the first match when calling here
      updateHighlights(state);

      // TODO: This would be a good place to set everything to storage
      console.log(state.matchesObj);
    },
  });
}

function updateHighlights(state, prevIndex?: number) {
  if (!state.matches.length) {
    return;
  }

  if (typeof prevIndex === 'number') {
    const prevMatch = state.matches[prevIndex];
    prevMatch.classList.remove('ctrl-f-highlight-focus');
  }

  const curMatch = state.matches[state.currentIndex];
  curMatch.classList.add('ctrl-f-highlight-focus');
  scrollToElement(curMatch);
}

export function nextMatch(state) {
  console.log('getInnerHtmlScript - nextMatch()');
  const prevIndex = state.currentIndex;
  state.currentIndex = (state.currentIndex + 1) % state.matches.length;

  // if (currentIndex === 0) {
  //   // If it's the first match again, we've looped through all matches
  //   // Notify background script to check the next tab
  //   chrome.runtime.sendMessage({ type: 'next-match' });
  // } else {
  updateHighlights(state, prevIndex);
  // }
}

export function previousMatch(state) {
  const prevIndex = state.currentIndex;
  state.currentIndex =
    (state.currentIndex - 1 + state.matches.length) % state.matches.length;

  updateHighlights(state, prevIndex);
}

function scrollToElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
