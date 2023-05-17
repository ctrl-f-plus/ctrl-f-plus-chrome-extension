// src/utils/htmlUtils.ts

import {
  JSONString,
  SerializedTabState,
  TabState,
  XPathMatchObject,
} from '../types/tab.types';

function getXPath(element: Node): string {
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
  // FIXME: I think this function is getting called too many times on the intial search. uncomment the console log to test
  // console.log(`serializeMatchesObj: shallowStateObject: `, shallowStateObject);
  const { matchesObj, ...otherProperties } = shallowStateObject;
  const xpaths: XPathMatchObject[] = generateXPaths(matchesObj);
  const serializedXPaths: JSONString = JSON.stringify(xpaths);
  const serializedState: SerializedTabState = {
    ...otherProperties,
    serializedMatches: serializedXPaths,
  };
  return serializedState;
}

/**
 *
 * UTILS FOR RESTORING MATCHES HTML
 */

function getElementByXPath(xpath: string) {
  let result = null;

  // Check if the xpath starts with "//" (indicating an ID-based xpath)
  if (xpath.startsWith('//')) {
    // Evaluate the xpath expression from the root of the document
    result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  } else {
    // If it doesn't start with "//", prepend it with "/html/"
    const modifiedXpath = '/html/' + xpath;
    result = document.evaluate(
      modifiedXpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  }

  return result;
}

// FIXME: fix typing: `any`
export function wrapTextWithHighlight(
  element: any,
  text: string,
  spanClasses: any[]
): HTMLSpanElement {
  const textNodeIndex = Array.prototype.slice
    .call(element.childNodes)
    .findIndex(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent.includes(text)
    );

  if (textNodeIndex === -1) return document.createElement('span');

  const textNode = element.childNodes[textNodeIndex];
  const range = document.createRange();
  const span = document.createElement('span');

  span.classList.add(...spanClasses);
  range.setStart(textNode, textNode.textContent.indexOf(text));
  range.setEnd(textNode, textNode.textContent.indexOf(text) + text.length);
  range.surroundContents(span);

  return span;
}

// FIXME:
// @ts-ignore
export function restoreHighlightSpans(xPathTabState: XPathTabState): TabState {
  const tabXPaths: XPathMatchObject[] = xPathTabState.matchesObj;

  const tabState: TabState = { ...xPathTabState };

  tabState.matchesObj = [];

  tabXPaths.forEach(({ xpath, text, spanClasses }) => {
    // const element = '/html/' + getElementByXPath(xpath);

    const element = getElementByXPath(xpath);

    if (element) {
      wrapTextWithHighlight(element, text, spanClasses);

      const spanElement = (element as Element).querySelector('span');
      if (spanElement !== null) {
        tabState.matchesObj.push(spanElement);
      }
    }
  });

  return tabState;
}

export function deserializeMatchesObj(
  shallowStateObject: SerializedTabState
): TabState {
  const { serializedMatches, ...otherProperties } = shallowStateObject;

  const serializedXPaths = serializedMatches;

  const deserializedXPaths =
    serializedXPaths === '' ? [] : JSON.parse(serializedXPaths);

  const deserializedState: TabState = {
    ...otherProperties,
    matchesObj: deserializedXPaths,
  };

  return deserializedState;
}
