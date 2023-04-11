// src/contentScripts/highlighter.ts

import { scrollToElement } from './scroll';

let currentIndex = 0;
let matches = [];
let searchValue = '';

interface searchAndHighlightProps {
  node: Node;
  findValue: string;
  callback: () => void;
}

export const searchAndHighlight = (props: searchAndHighlightProps) => {
  const { node, findValue, callback } = props;

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const matchIndex = node.data
        .toLowerCase()
        .indexOf(findValue.toLowerCase());
      if (matchIndex !== -1) {
        const range = document.createRange();
        range.setStart(node, matchIndex);
        range.setEnd(node, matchIndex + findValue.length);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        range.surroundContents(span);
        matches.push(span);
      }
    } else {
      for (let child of node.childNodes) {
        searchAndHighlight({
          node: child,
          findValue: findValue,
          callback: callback,
        });
      }
    }
  }

  window.requestIdleCallback(() => {
    processNode(node);
    if (callback) {
      callback();
    }
  });
};

interface findAllMatchesProps {
  findValue: string;
}

export const findAllMatches = ({ findValue }: findAllMatchesProps) => {
  matches = [];
  currentIndex = 0;
  searchValue = findValue;
  const props: searchAndHighlightProps = {
    node: document.body,
    findValue,
    callback: () => {
      console.log('Search and highlighting completed');
      updateHighlights();
    },
  };
  searchAndHighlight(props);
};

export const updateHighlights = () => {
  matches.forEach((match, index) => {
    if (index === currentIndex) {
      match.style.backgroundColor = 'yellow';
      scrollToElement({ element: match });
    } else {
      match.style.backgroundColor = '';
    }
  });
};

export const nextMatch = () => {
  currentIndex = (currentIndex + 1) % matches.length;
  if (currentIndex === 0) {
    // If it's the first match again, we've looped through all matches
    // Notify background script to check the next tab
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'next-match', // Change the type here
      findValue: searchValue,
    });
  } else {
    updateHighlights();
  }
};

export const previousMatch = () => {
  currentIndex = (currentIndex - 1 + matches.length) % matches.length;
  updateHighlights();
};
