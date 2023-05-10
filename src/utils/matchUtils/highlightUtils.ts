// src/utils/matchUtils/highlightUtils.ts

import {
  CreateHighlightSpanProps,
  GetAllTextNodesToProcessProps,
  ProcessTextNodeProps,
  SearchAndHighlightProps,
  UpdateMatchesObjectProps,
} from '../../types/highlightUtils.types';

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
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (
          node.nodeName !== 'SCRIPT' &&
          node.nodeName !== 'STYLE' &&
          // TODO: REVIEW IF YOU NEED `SVG` OR NOT  - ALSO MAKE SURE YOU ARE NOT EXCLUDING TOO MUCH
          node.nodeName !== 'SVG' &&
          isVisible(node)
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      },
    }
  );
}

function createHighlightSpan({
  matchText,
}: CreateHighlightSpanProps): HTMLElement {
  const span = document.createElement('span');
  span.className = 'ctrl-f-highlight';
  span.textContent = matchText;

  return span;
}

function updateMatchesObject({ state2, span }: UpdateMatchesObjectProps) {
  state2.matchesObj.push(span);
}

function getAllTextNodesToProcess({
  regex,
}: GetAllTextNodesToProcessProps): Node[] {
  const textNodesToProcess = [];
  const treeWalker = createCustomTreeWalker();
  let currentNode = treeWalker.nextNode();

  while (currentNode) {
    regex.lastIndex = 0;
    if (currentNode.nodeType === 3 && regex.test((currentNode as Text).data)) {
      textNodesToProcess.push(currentNode);
    }
    currentNode = treeWalker.nextNode();
  }

  return textNodesToProcess;
}

function processTextNode({ textNode, regex, state2 }: ProcessTextNodeProps) {
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

  regex.lastIndex = 0;
  while ((match = regex.exec(textNodeAsText.data)) !== null) {
    const beforeMatch = textNodeAsText.data.slice(lastIndex, match.index);
    const matchText = match[0];
    lastIndex = match.index + matchText.length;

    if (beforeMatch) {
      fragment.appendChild(document.createTextNode(beforeMatch));
    }

    const span = createHighlightSpan({ matchText });

    updateMatchesObject({ state2, span });
    state2.matchesCount += 1;
    fragment.appendChild(span);
  }

  const afterMatch = textNodeAsText.data.slice(lastIndex);
  if (afterMatch) {
    fragment.appendChild(document.createTextNode(afterMatch));
  }

  parent.replaceChild(fragment, textNode);
}

// `searchAndHighlight()` is only called from within `matchUtils.ts`
export function searchAndHighlight({
  state2,
  findValue,
  callback,
}: SearchAndHighlightProps) {
  const regex = new RegExp(findValue, 'gi');
  const textNodesToProcess = getAllTextNodesToProcess({ regex });

  textNodesToProcess.forEach((textNode) => {
    processTextNode({ textNode, regex, state2 });
  });

  callback && callback();
}

//  TODO: maybe move to contentScript as `removeAllHighlightMatches()` is only called from within `contentScript.tsx`
export function removeAllHighlightMatches() {
  const highlightElements = document.querySelectorAll(
    '.ctrl-f-highlight, .ctrl-f-highlight-focus'
  );

  highlightElements.forEach((elem) => {
    const parent = elem.parentNode;
    const textContent = elem.textContent;

    if (!parent || !textContent) {
      console.warn(
        'removeAllHighlights: Missing parent Node or textContent for elem:',
        elem
      );
      return;
    }

    const textNode = document.createTextNode(textContent);
    parent.replaceChild(textNode, elem);
  });
}
