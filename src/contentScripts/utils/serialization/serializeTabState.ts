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

  let index = 1;
  let sibling = htmlElement.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === htmlElement.tagName) {
      index += 1;
    }
    sibling = sibling.previousElementSibling;
  }

  return `${getXPath(htmlElement.parentNode as Node)}/${
    htmlElement.tagName
  }[${index}]`;
}

function generateXPaths(matchesObj: HTMLSpanElement[]): XPathMatchObject[] {
  const xpaths: XPathMatchObject[] = matchesObj.map((el) => {
    const xpath: string = getXPath(el as Node); // generate XPath for the span element itself
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
  console.log('matchesObj', matchesObj);
  console.log('otherProperties', otherProperties);
  const xpaths: XPathMatchObject[] = generateXPaths(matchesObj);
  const serializedXPaths: JSONString = JSON.stringify(xpaths);
  const serializedState: SerializedTabState = {
    ...otherProperties,
    serializedMatches: serializedXPaths,
  };
  return serializedState;
}
