// src/contentScripts/getInnerHtmlScript.ts

// const sendMessageToBackground = () => {
//   chrome.runtime.sendMessage({
//     from: 'content',
//     type: 'content',
//     payload: { title: document.title, innerHtml: document.body.innerHTML },
//   });
// };
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

function findAllMatches(value: string) {
  const regex = new RegExp(`(${value})`, 'gi');
  let match;
  matches = [];
  while ((match = regex.exec(document.body.innerHTML)) !== null) {
    matches.push({
      index: match.index,
      length: match[1].length,
    });
  }
  currentIndex = 0;
  searchValue = value;
}

function highlightMatch() {
  if (matches.length === 0) return;

  const currentMatch = matches[currentIndex];
  const beforeMatch = document.body.innerHTML.slice(0, currentMatch.index);
  const matchValue = document.body.innerHTML.slice(
    currentMatch.index,
    currentMatch.index + currentMatch.length
  );
  const afterMatch = document.body.innerHTML.slice(
    currentMatch.index + currentMatch.length
  );

  const highlightedMatch = `<mark style="background-color: yellow; padding: 2px;">${matchValue}</mark>`;

  document.body.innerHTML = beforeMatch + highlightedMatch + afterMatch;
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
  console.log('Message received:', message); // Add this line
  if (message.type === 'highlight') {
    findAllMatches(message.findValue);
    highlightMatch();
  } else if (message.type === 'next-match') {
    nextMatch();
  } else if (message.type === 'previous-match') {
    previousMatch();
  }
});
