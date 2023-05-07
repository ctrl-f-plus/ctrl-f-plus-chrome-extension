// src/utils/htmlUtils.ts

import { JSONString, SerializedTabState, TabState } from '../types/tab.types';

export interface XPathMatchObject {
  text: string;
  xpath: string;
  spanClasses: string[];
}

export function getXPath(element: Node): string {
  if (element.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const htmlElement = element as HTMLElement;

  if (htmlElement.id !== '') {
    return `//*[@id="${htmlElement.id}"]`;
  }

  if (htmlElement === document.body) {
    return htmlElement.tagName;
  }

  let siblingIndex = 1;
  let sibling = htmlElement;
  while (sibling.previousSibling) {
    sibling = sibling.previousSibling as HTMLElement;
    if (
      sibling.nodeType === Node.ELEMENT_NODE &&
      sibling.tagName === htmlElement.tagName
    ) {
      siblingIndex++;
    }
  }

  return `${getXPath(htmlElement.parentNode as Node)}/${
    htmlElement.tagName
  }[${siblingIndex}]`;
}

function generateXPaths(matchesObj: HTMLSpanElement[]): XPathMatchObject[] {
  const xpaths: XPathMatchObject[] = matchesObj.map((el) => {
    const xpath: string = getXPath(el.parentNode as Node);
    const text = el.textContent || '';
    const spanClasses = Array.from(el.classList);
    return { xpath, text, spanClasses };
  });

  return xpaths;
}

export function serializeMatchesObj(
  shallowStateObject: TabState
): SerializedTabState {
  const { matchesObj, ...otherProperties } = shallowStateObject;
  const xpaths: XPathMatchObject[] = generateXPaths(matchesObj);
  const serializedXPaths: JSONString = JSON.stringify(xpaths);

  const serializedState: SerializedTabState = {
    ...otherProperties,
    serializedMatches: serializedXPaths,
  };
  return serializedState;
}

export function deserializeMatchesObj(
  shallowStateObject: SerializedTabState
): TabState {
  const { serializedMatches, ...otherProperties } = shallowStateObject;

  const serializedXPaths = serializedMatches;
  const deserializedXPaths = JSON.parse(serializedXPaths);

  // return restoreHighlightSpans(deSerializedXPaths);
  const deserializedState: TabState = {
    ...otherProperties,
    matchesObj: deserializedXPaths,
  };
  return deserializedState;
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

// @ts-ignore
export function getElementByXPath(xpath) {
  return document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

// @ts-ignore
export function wrapTextWithHighlight(element, text, spanClasses) {
  debugger;

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

// FIXME: Add types
// @ts-ignore
export function restoreHighlightSpans(xpathObj) {
  debugger;
  Object.keys(xpathObj).forEach((tabId) => {
    const tabXPaths = xpathObj[tabId];
    // @ts-ignore
    tabXPaths.forEach(({ xpath, text, spanClasses }) => {
      const element = getElementByXPath(xpath);
      if (element) {
        wrapTextWithHighlight(element, text, spanClasses);
      }
    });
  });
}
