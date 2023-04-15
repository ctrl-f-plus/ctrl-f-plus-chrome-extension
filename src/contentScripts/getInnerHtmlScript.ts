// src/contentScripts/getInnerHtmlScript.ts

///////////////////////////////////////
// import '../glo';
(function () {
  if (window.myUniqueExtensionFlag) {
    // The content script has already been injected, so exit early
    console.log('Content script already injected. Exiting...');
    return;
  }

  // Set the unique flag to indicate that the content script has been injected
  window.myUniqueExtensionFlag = true;
  ///////////////////////////////////////

  console.log('getInnerHtmlScript.js - Executed');
  const contentStylesImport = require('./contentStyles.ts');

  // import { getStoredAllMatches, setStoredAllMatches } from '../utils/storage';

  // FIXME: ES modules, which are not yet fully supported by the content scripts in Chrome extensions
  // import contentStyles from './contentStyles.js';

  let currentIndex;
  let matches;
  let tabId;

  function injectStyles(css) {
    const style = document.createElement('style');

    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  // function searchAndHighlight(node, findValue, callback) {
  //   console.log('searchAndHighlight()');
  //   function processNode(node) {
  //     if (node.nodeType === Node.TEXT_NODE && node.data) {
  //       const nodeData = node.data || '';
  //       const matchIndex = nodeData
  //         .toLowerCase()
  //         .indexOf(findValue.toLowerCase());

  //       if (matchIndex !== -1) {
  //         const range = document.createRange();
  //         range.setStart(node, matchIndex);
  //         range.setEnd(node, matchIndex + findValue.length);

  //         const span = document.createElement('span');
  //         span.classList.add('ctrl-f-highlight');
  //         range.surroundContents(span);
  //         matches.push(span);
  //       }
  //     } else {
  //       for (let child of node.childNodes) {
  //         searchAndHighlight(child, findValue, callback);
  //       }
  //     }
  //   }

  //   window.requestIdleCallback(() => {
  //     processNode(node);
  //     if (callback) {
  //       callback();
  //     }
  //   });
  // }

  function searchAndHighlight(findValue, callback) {
    console.log(`searchAndHighlight(${findValue}, ${callback})`);
    const treeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeName !== 'SCRIPT') return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_SKIP;
        },
      }
    );

    const regex = new RegExp(findValue, 'gi');
    const textNodesToProcess = [];
    let currentNode = treeWalker.nextNode();
    while (currentNode) {
      if (
        currentNode.nodeType === 3 &&
        regex.test((currentNode as Text).data)
      ) {
        textNodesToProcess.push(currentNode);
      }
      currentNode = treeWalker.nextNode();
    }

    // debugger;
    textNodesToProcess.forEach((textNode) => {
      const textNodeAsText = textNode as Text;
      let match;
      let lastIndex = 0;
      const parent = textNode.parentNode;
      const fragment = document.createDocumentFragment();

      regex.lastIndex = 0; // Reset the regex lastIndex property for the next iteration
      while ((match = regex.exec(textNodeAsText.data)) !== null) {
        const beforeMatch = textNodeAsText.data.slice(lastIndex, match.index);
        const matchText = match[0];
        lastIndex = match.index + matchText.length;

        if (beforeMatch) {
          fragment.appendChild(document.createTextNode(beforeMatch));
        }
        const span = document.createElement('span');
        span.className = 'ctrl-f-highlight';
        span.textContent = matchText;
        // TODO: HERE!
        matches.push(span);
        fragment.appendChild(span);
      }

      const afterMatch = textNodeAsText.data.slice(lastIndex);
      if (afterMatch) {
        fragment.appendChild(document.createTextNode(afterMatch));
      }
      parent.replaceChild(fragment, textNode);
    });

    if (callback) {
      // debugger;
      callback();
    }
  }

  function findAllMatches(findValue) {
    console.log(`findAllMatches(${findValue})`);
    matches = [];
    currentIndex = 0;

    // searchAndHighlight(findValue, updateHighlights());
    searchAndHighlight(findValue, () => {
      // FIXME: uncomment the clg and review. This should not be runnning/printing that many times
      console.log('Inside Callback - Search and highlighting completed');
      updateHighlights();
    });
  }

  function updateHighlights(prevIndex?: number) {
    console.log(`updateHighlights(${prevIndex})`);
    // debugger;
    if (!matches.length) {
      return;
    }

    if (typeof prevIndex === 'number') {
      const prevMatch = matches[prevIndex];
      prevMatch.classList.remove('ctrl-f-highlight-focus');
    }

    const curMatch = matches[currentIndex];
    curMatch.classList.add('ctrl-f-highlight-focus');
    scrollToElement(curMatch);
  }

  function nextMatch() {
    console.log('nextMatch()');
    const prevIndex = currentIndex;
    currentIndex = (currentIndex + 1) % matches.length;
    console.log(currentIndex);
    // if (currentIndex === 0) {
    //   // If it's the first match again, we've looped through all matches
    //   // Notify background script to check the next tab
    //   chrome.runtime.sendMessage({ type: 'next-match' });
    // } else {
    updateHighlights(prevIndex);
    // }
  }

  function previousMatch() {
    console.log('previousMatch()');
    const prevIndex = currentIndex;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;

    updateHighlights(prevIndex);
  }

  function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  injectStyles(contentStylesImport);

  function handleMessage(message, sender, sendResponse) {
    console.log('Received message:', message, 'Message ID:', message.messageId);
    // Your existing message handling code
    // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log('Received message:', message, 'Message ID:', message.messageId);
    if (message.type === 'highlight') {
      console.log('highlight - msg');
      tabId = message.tabId;
      // debugger;
      findAllMatches(message.findValue);

      return;
    }

    if (message.type === 'get-all-matches-req') {
      console.log('get-all-matches-req - msg');
      console.log('allMatches:', matches);

      return;
    }

    if (message.type === 'next-match') {
      console.log('nextMatch - msg');
      if (matches.length > 0) {
        nextMatch();
        sendResponse({ hasMatch: true, tabId: tabId });
      } else {
        sendResponse({ hasMatch: false, tabId: tabId });
      }

      return;
    }

    if (message.type === 'prev-match') {
      console.log('prevMatch - msg');
      previousMatch();

      return;
    }

    if (message.type === 'get-inner-html') {
      console.log('get-innter-html - msg');
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
  }
  // });

  chrome.runtime.onMessage.addListener(handleMessage);

  // Remove the listener when the extension is deactivated or the tab is closed
  window.addEventListener('unload', () => {
    chrome.runtime.onMessage.removeListener(handleMessage);
  });
})();
