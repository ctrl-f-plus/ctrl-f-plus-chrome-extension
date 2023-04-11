// src/contentScripts/getInnerHtmlScript.ts

chrome.runtime.sendMessage({
  from: 'content',
  type: 'get-inner-html',
  payload: { title: document.title, innerHtml: document.body.innerHTML },
});

/////////////////////////////////////////////////////////////////////////////
let currentIndex = 0;
let matches = [];
let searchValue = '';

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
        span.style.backgroundColor = 'yellow';
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
      match.style.backgroundColor = 'yellow';
      scrollToElement(match); // Add this line
    } else {
      match.style.backgroundColor = '';
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  if (message.type === 'highlight') {
    findAllMatches(message.findValue);
  } else if (message.type === 'next-match') {
    if (matches.length > 0) {
      nextMatch();
      sendResponse({ hasMatch: true }); // Update this line
    } else {
      sendResponse({ hasMatch: false }); // Update this line
    }
  } else if (message.type === 'previous-match') {
    previousMatch();
  }
});
