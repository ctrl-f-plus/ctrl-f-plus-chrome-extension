// src/contentScripts/getInnerHtmlScript.ts

// import './contentScript.css';

chrome.runtime.sendMessage({
  from: 'content',
  type: 'get-inner-html',
  // payload: document.body.innerHTML,
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
        span.style.backgroundColor = 'yellow'; // Add inline styling
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
  // highlightMatch();
  updateHighlights();
}

function previousMatch() {
  currentIndex = (currentIndex - 1 + matches.length) % matches.length;
  // highlightMatch();
  updateHighlights();
}

function scrollToElement(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

chrome.runtime.onMessage.addListener((message) => {
  console.log('Message received:', message);

  if (message.type === 'highlight') {
    findAllMatches(message.findValue);
    // highlightMatch();
  } else if (message.type === 'next-match') {
    nextMatch();
  } else if (message.type === 'previous-match') {
    previousMatch();
  }
});
