// src/utils/restoreHighlightSpans.ts

import { TabState, XPathTabState } from '../../types/tab.types';
import createSpan from './createSpan';

function getElementByXPath(xpath: string) {
  let result = null;

  if (xpath.startsWith('//')) {
    result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  } else {
    const modifiedXpath = `/html/${xpath}`;
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

function wrapTextWithHighlight(
  element: Node,
  text: string,
  spanClasses: string[]
): HTMLSpanElement {
  const textNodeIndex = Array.prototype.slice
    .call(element.childNodes)
    .findIndex(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent.includes(text)
    );

  if (textNodeIndex === -1) return createSpan([]);

  const textNode = element.childNodes[textNodeIndex];
  const range = document.createRange();
  const span = createSpan(spanClasses);

  if (textNode.textContent !== null) {
    range.setStart(textNode, textNode.textContent.indexOf(text));
    range.setEnd(textNode, textNode.textContent.indexOf(text) + text.length);
  }

  range.surroundContents(span);
  return span;
}

export default function restoreHighlightSpans(
  xPathTabState: XPathTabState,
  restoreHighlights: boolean
): TabState {
  const { queryMatches: tabXPaths, ...rest } = xPathTabState;
  const tabState: TabState = { ...rest, queryMatches: [] };

  if (!restoreHighlights) {
    return tabState;
  }

  tabXPaths.forEach(({ xpath, text, spanClasses }) => {
    const element = getElementByXPath(xpath);

    if (element) {
      wrapTextWithHighlight(element, text, spanClasses);

      const spanElement: HTMLSpanElement | null = (
        element as Element
      ).querySelector('span');

      if (spanElement) {
        tabState.queryMatches.push(spanElement);
      }
    }
  });

  return tabState;
}
