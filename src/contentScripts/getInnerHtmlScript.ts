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

// function findAllMatches(value: string) {
//   const regex = new RegExp(`(${value})`, 'gi');
//   let match;
//   matches = [];
//   while ((match = regex.exec(document.body.innerHTML)) !== null) {
//     matches.push({
//       index: match.index,
//       length: match[1].length,
//     });
//   }
//   currentIndex = 0;
//   searchValue = value;
// }

function searchAndHighlight(node, findValue, callback) {
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const matchIndex = node.data
        .toLowerCase()
        .indexOf(findValue.toLowerCase());
      // if (matchIndex !== -1) {
      //   const range = document.createRange();
      //   range.setStart(node, matchIndex);
      //   range.setEnd(node, matchIndex + findValue.length);
      //   const span = document.createElement('span');
      //   span.className = 'highlight';
      //   range.surroundContents(span);
      //   matches.push(span);
      // }
      if (matchIndex !== -1) {
        const range = document.createRange();
        range.setStart(node, matchIndex);
        range.setEnd(node, matchIndex + findValue.length);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow'; // Add inline styling
        // span.style.padding = '2px'; // Add inline styling
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
  });
}

function createMarkNode(matchValue: string) {
  const markNode = document.createElement('mark');
  markNode.style.backgroundColor = 'yellow';
  markNode.style.padding = '2px';
  markNode.textContent = matchValue;
  return markNode;
}

function highlightMatch() {
  if (matches.length === 0) return;

  const currentMatch = matches[currentIndex];
  const body = document.body;

  let textNodeIndex = -1;
  let matchIndex = 0;

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodeIndex++;

      if (textNodeIndex === currentMatch.index) {
        const textNode = node as Text;
        const matchNode = createMarkNode(currentMatch.value);
        const parentNode = textNode.parentNode;

        parentNode.insertBefore(matchNode, textNode);
        parentNode.removeChild(textNode);

        matchIndex++;
      }
    } else {
      node.childNodes.forEach((childNode) => walk(childNode));
    }
  };

  walk(body);
}

function nextMatch() {
  currentIndex = (currentIndex + 1) % matches.length;
  highlightMatch();
}

function previousMatch() {
  currentIndex = (currentIndex - 1 + matches.length) % matches.length;
  highlightMatch();
}

chrome.runtime.onMessage.addListener((message) => {
  console.log('Message received:', message);

  if (message.type === 'highlight') {
    findAllMatches(message.findValue);
    highlightMatch();
  } else if (message.type === 'next-match') {
    nextMatch();
  } else if (message.type === 'previous-match') {
    previousMatch();
  }
});
