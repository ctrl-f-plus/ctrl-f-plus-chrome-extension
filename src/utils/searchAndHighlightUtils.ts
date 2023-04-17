// src/utils/searchAndHighlightUtils.ts

interface MatchUtilsBase {
  currentIndex?: number;
  matches: HTMLElement[];
  matchesObj: MatchesObject;
  tabId: number;
}

interface CreateHighlightSpanProps {
  matchText: string;
}

interface UpdateMatchesObjectProps extends MatchUtilsBase {
  span: HTMLElement;
}

interface GetAllTextNodesToProcessProps {
  regex: RegExp;
}

interface ProcessTextNodeProps extends MatchUtilsBase {
  textNode: Node;
  regex: RegExp;
}

interface SearchAndHighlightProps extends MatchUtilsBase {
  findValue: string;
  callback?: () => void;
}

type MatchesObject = {
  [tabId: number]: HTMLElement[];
};

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
          node.nodeName !== 'SVG'
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

function updateMatchesObject({
  // matches,
  matchesObj,
  tabId,
  span,
}: UpdateMatchesObjectProps) {
  if (matchesObj.hasOwnProperty(tabId)) {
    // debugger;

    matchesObj[tabId].push(span);
  } else {
    matchesObj[tabId] = [span];
  }
}

function getAllTextNodesToProcess({
  regex,
}: GetAllTextNodesToProcessProps): Node[] {
  const textNodesToProcess = [];
  const treeWalker = createCustomTreeWalker();
  let currentNode = treeWalker.nextNode();

  while (currentNode) {
    if (currentNode.nodeType === 3 && regex.test((currentNode as Text).data)) {
      textNodesToProcess.push(currentNode);
    }
    currentNode = treeWalker.nextNode();
  }

  return textNodesToProcess;
}

function processTextNode({
  textNode,
  regex,
  matches,
  matchesObj,
  tabId,
}: ProcessTextNodeProps) {
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
    // TODO: HERE!
    // matches.push(span);

    updateMatchesObject({ matches, matchesObj, tabId, span });
    fragment.appendChild(span);
  }

  const afterMatch = textNodeAsText.data.slice(lastIndex);
  if (afterMatch) {
    fragment.appendChild(document.createTextNode(afterMatch));
  }

  parent.replaceChild(fragment, textNode);
}

export function removeAllHighlightMatches() {
  const highlightElements = document.querySelectorAll(
    '.ctrl-f-highlight, .ctrl-f-highlight-focus'
  );

  highlightElements.forEach((elem) => {
    const parent = elem.parentNode;
    if (!parent) {
      console.warn(
        'removeAllHighlights: Parent node not found for elem:',
        elem
      );
      return;
    }

    const textNode = document.createTextNode(elem.textContent);
    parent.replaceChild(textNode, elem);
  });
}

export function searchAndHighlight({
  currentIndex,
  matches,
  matchesObj,
  findValue,
  tabId,
  callback,
}: SearchAndHighlightProps) {
  const regex = new RegExp(findValue, 'gi');
  const textNodesToProcess = getAllTextNodesToProcess({ regex });

  textNodesToProcess.forEach((textNode) => {
    processTextNode({ textNode, regex, matches, matchesObj, tabId });
  });

  callback && callback();
}
