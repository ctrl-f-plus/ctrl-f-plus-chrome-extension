// src/utils/matchUtils/highlightUtils.ts

import { TabState } from '../../types/tab.types';
import { HIGHLIGHT_CLASS } from '../constants';
import createSpan from '../dom/createSpan';

function isVisible(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const style = window.getComputedStyle(node as HTMLElement);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
  }
  return node.parentNode ? isVisible(node.parentNode) : true;
}

function createCustomTreeWalker() {
  return document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT || NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (
          node.nodeName !== 'SCRIPT' &&
          node.nodeName !== 'STYLE' &&
          node.nodeName !== 'SVG' &&
          isVisible(node) &&
          node.textContent?.trim() !== ''
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      },
    }
  );
}

// function createHighlightSpan(matchText: string): HTMLElement {
//   const span = document.createElement('span');
//   span.className = HIGHLIGHT_CLASS;
//   span.textContent = matchText;

//   return span;
// }

function updateMatchesObject(span: HTMLElement, state2?: TabState) {
  state2?.matchesObj.push(span);
}

function getAllTextNodesToProcess(regex: RegExp): Node[] {
  const textNodesToProcess = [];
  const treeWalker = createCustomTreeWalker();
  let currentNode = treeWalker.nextNode();
  const regexClone = regex;

  while (currentNode) {
    regexClone.lastIndex = 0;
    if (
      currentNode.nodeType === 3 &&
      regexClone.test((currentNode as Text).data)
    ) {
      textNodesToProcess.push(currentNode);
    }
    currentNode = treeWalker.nextNode();
  }

  return textNodesToProcess;
}

function processTextNode(textNode: Node, regex: RegExp, state2?: TabState) {
  const parent = textNode.parentNode;
  if (!parent) {
    console.warn(
      'processTextNode: Parent node not found for textNode:',
      textNode
    );
    return;
  }

  const textNodeAsText = textNode as Text;
  let match;
  let lastIndex = 0;
  const fragment = document.createDocumentFragment();
  const regexClone = regex;

  regexClone.lastIndex = 0;
  match = regexClone.exec(textNodeAsText.data);
  while (match) {
    const beforeMatch = textNodeAsText.data.slice(lastIndex, match.index);
    const matchText = match[0];
    lastIndex = match.index + matchText.length;

    if (beforeMatch) {
      fragment.appendChild(document.createTextNode(beforeMatch));
    }

    const span = createSpan([HIGHLIGHT_CLASS], matchText);

    updateMatchesObject(span, state2);

    state2.matchesCount += 1; // FIXME: maybe add state class -> // updatedState.matchesObj.push(span);

    fragment.appendChild(span);

    match = regexClone.exec(textNodeAsText.data);
  }

  const afterMatch = textNodeAsText.data.slice(lastIndex);
  if (afterMatch) {
    fragment.appendChild(document.createTextNode(afterMatch));
  }

  parent.replaceChild(fragment, textNode);
}

export default function searchAndHighlight(
  state2: TabState,
  findValue: string
) {
  return new Promise<void>((resolve, reject) => {
    try {
      const normalizedFindValue = findValue.replace(/\s+/g, ' ');
      const findValueWithSpaceOrNBSP = normalizedFindValue
        .split(' ')
        .join('( |\\u00A0)');
      const regex = new RegExp(findValueWithSpaceOrNBSP, 'gi');

      const textNodesToProcess = getAllTextNodesToProcess(regex);

      textNodesToProcess.forEach((textNode) => {
        processTextNode(textNode, regex, state2);
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
