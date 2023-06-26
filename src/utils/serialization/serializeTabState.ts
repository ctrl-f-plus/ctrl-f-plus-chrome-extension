// src/utils/serializeTabState.ts

import {
  JSONString,
  SerializedTabState,
  TabState,
  XPathMatchObject,
} from '../../types/tab.types';

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
      siblingIndex += 1;
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

export default function serializeTabState(
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
