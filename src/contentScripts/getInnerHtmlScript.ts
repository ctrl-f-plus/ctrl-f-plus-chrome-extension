// src/contentScripts/getInnerHtmlScript.ts

const contentStylesImport = require('./contentStyles.ts');
// FIXME: ES modules, which are not yet fully supported by the content scripts in Chrome extensions
// import contentStyles from './contentStyles.js';

let currentIndex = 0;
let matches = [];
let searchValue = '';
let tabId;

function injectStyles(css) {
  const style = document.createElement('style');

  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

function searchAndHighlight(node, findValue, callback) {
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
        span.classList.add('ctrl-f-highlight');
        range.surroundContents(span);
        matches.push(span);
      }
    } else {
      for (let child of node.childNodes) {
        searchAndHighlight(child, findValue, callback);
      }
    }
  }

  window.requestIdleCallback(() => {
    processNode(node);
    if (callback) {
      callback();
    }
  });
}

function findAllMatches(findValue) {
  matches = [];
  currentIndex = 0;

  searchAndHighlight(document.body, findValue, () => {
    console.log('Search and highlighting completed');
    updateHighlights();
  });
}

function updateHighlights() {
  matches.forEach((match, index) => {
    if (index === currentIndex) {
      match.classList.add('ctrl-f-highlight-focus');
      scrollToElement(match);
    } else {
      match.classList.remove('ctrl-f-highlight-focus');
    }
  });
}

function nextMatch() {
  currentIndex = (currentIndex + 1) % matches.length;

  if (currentIndex === 0) {
    // If it's the first match again, we've looped through all matches
    // Notify background script to check the next tab
    chrome.runtime.sendMessage({ type: 'next-match' });
  } else {
    updateHighlights();
  }
}

function previousMatch() {
  currentIndex = (currentIndex - 1 + matches.length) % matches.length;

  updateHighlights();
}

function scrollToElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

injectStyles(contentStylesImport);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   console.log('Message received:', message);

  if (message.type === 'highlight') {
    tabId = message.tabId;
    findAllMatches(message.findValue);

    return;
  }

  if (message.type === 'get-all-matches-req') {
    console.log('allMatches:', matches);

    return;
  }

  if (message.type === 'next-match') {
    if (matches.length > 0) {
      nextMatch();
      sendResponse({ hasMatch: true, tabId: tabId });
    } else {
      sendResponse({ hasMatch: false, tabId: tabId });
    }

    return;
  }

  if (message.type === 'prev-match') {
    previousMatch();

    return;
  }

  if (message.type === 'get-inner-html') {
    const tabId = message.tabId;
    // Replace 'matchesArray' with the actual variable name that contains the array of matches
    const matchesArray = [];

    chrome.runtime.sendMessage({
      from: 'content',
      type: 'get-inner-html',
      payload: {
        tabId: tabId,
        title: document.title,
        matches: matchesArray,
      },
    });

    return;
  }
});
