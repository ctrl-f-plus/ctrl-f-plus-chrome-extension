//@ts-nocheck
// src/utils/htmlUtils.ts

import { SerializedTabState, TabState } from '../types/tab.types';

export function getXPath(element) {
  if (element.id !== '') {
    return `//*[@id="${element.id}"]`;
  }
  if (element === document.body) {
    return element.tagName;
  }

  let siblingIndex = 1;
  let sibling = element;
  while (sibling.previousSibling) {
    sibling = sibling.previousSibling;
    if (
      sibling.nodeType === Node.ELEMENT_NODE &&
      sibling.tagName === element.tagName
    ) {
      siblingIndex++;
    }
  }

  return `${getXPath(element.parentNode)}/${element.tagName}[${siblingIndex}]`;
}

export function getElementByXPath(xpath) {
  return document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

export function wrapTextWithHighlight(element, text, spanClasses) {
  const textNodeIndex = Array.prototype.slice
    .call(element.childNodes)
    .findIndex(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent.includes(text)
    );

  if (textNodeIndex === -1) return;

  const textNode = element.childNodes[textNodeIndex];
  const range = document.createRange();
  const span = document.createElement('span');

  span.classList.add(...spanClasses);
  range.setStart(textNode, textNode.textContent.indexOf(text));
  range.setEnd(textNode, textNode.textContent.indexOf(text) + text.length);
  range.surroundContents(span);
}

export function generateXPaths(matchesObj) {
  // const xpaths = {};
  // for (const tabId in matchesObj) {
  // xpaths[tabId] = matchesObj[tabId].map((el) => {
  // xpaths[tabId] = matchesObj.map((el) => {
  const xpaths = matchesObj.map((el) => {
    const xpath = getXPath(el.parentNode);
    const text = el.textContent;
    const spanClasses = Array.from(el.classList);
    return { xpath, text, spanClasses };
  });
  // }
  return xpaths;
}

export function restoreHighlightSpans(xpathObj) {
  Object.keys(xpathObj).forEach((tabId) => {
    const tabXPaths = xpathObj[tabId];
    tabXPaths.forEach(({ xpath, text, spanClasses }) => {
      const element = getElementByXPath(xpath);
      if (element) {
        wrapTextWithHighlight(element, text, spanClasses);
      }
    });
  });
}

// export function serializeMatchesObj(state) {
//   const matchesObj = state.matchesObj;
//   const xpaths = generateXPaths(state.matchesObj);
//   const serializedXPaths = JSON.stringify(xpaths);
//   state.matchesObj = serializedXPaths;
//   // return serializedXPaths;
// }

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

// export function serializeMatchesObj(matchesObj) {
//   // const matchesObj = state.matchesObj;
//   const xpaths = generateXPaths(matchesObj);
//   const serializedXPaths = JSON.stringify(xpaths);

//   return serializedXPaths;
// }

export type JSONString = string;

export function serializeMatchesObj(
  shallowStateObject: TabState
): SerializedTabState {
  const { matchesObj, ...otherProperties } = shallowStateObject;
  const xpaths = generateXPaths(matchesObj);
  const serializedXPaths: JSONString = JSON.stringify(xpaths);

  const serializedState2: SerializedTabState = {
    ...otherProperties,
    serializedMatches: serializedXPaths,
  };
  return serializedState2;
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

export function deserializeMatchesObj(matchesObj) {
  // const serializedStoredXPaths = localStorage.getItem('storedXPaths');

  const serializedXPaths = matchesObj;
  const deSerializedXPaths = JSON.parse(serializedXPaths);

  // return restoreHighlightSpans(deSerializedXPaths);
  return deSerializedXPaths;
}

// Example use
/**
 * const matchesObj = {
  237543846: [
    document.querySelector('nav > div > a > span.ctrl-f-highlight'),
    document.querySelector(
      'h1.display-3.text-center.font-alt-no-space > span.ctrl-f-highlight'
    ),
    document.querySelector('p > span.ctrl-f-highlight'),
  ],
};

const xpaths = generateXPaths(matchesObj);
const serializedXPaths = JSON.stringify(xpaths);
localStorage.setItem('storedXPaths', serializedXPaths);

const serializedStoredXPaths = localStorage.getItem('storedXPaths');
const storedXPaths = JSON.parse(serializedStoredXPaths);
restoreHighlightSpans(storedXPaths);
 */
