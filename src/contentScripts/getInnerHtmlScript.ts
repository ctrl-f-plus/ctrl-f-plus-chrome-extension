// src/contentScripts/getInnerHtmlScript.ts

(function () {
  if (window.myUniqueExtensionFlag) {
    // The content script has already been injected, so exit early
    console.log('Content script already injected. Exiting...');
    return;
  }

  // Set the unique flag to indicate that the content script has been injected
  window.myUniqueExtensionFlag = true;
  ///////////////////////////////////////

  const contentStylesImport = require('./contentStyles.ts');

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
      callback();
    }
  }

  function findAllMatches(findValue) {
    matches = [];
    currentIndex = 0;

    searchAndHighlight(findValue, () => {
      updateHighlights();
    });
  }

  function updateHighlights(prevIndex?: number) {
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
    const prevIndex = currentIndex;
    currentIndex = (currentIndex + 1) % matches.length;

    // if (currentIndex === 0) {
    //   // If it's the first match again, we've looped through all matches
    //   // Notify background script to check the next tab
    //   chrome.runtime.sendMessage({ type: 'next-match' });
    // } else {
    updateHighlights(prevIndex);
    // }
  }

  function previousMatch() {
    const prevIndex = currentIndex;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;

    updateHighlights(prevIndex);
  }

  function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  injectStyles(contentStylesImport);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message, 'Message ID:', message.messageId);
    if (message.type === 'highlight') {
      tabId = message.tabId;
      findAllMatches(message.findValue);
      return;
    }

    if (message.type === 'get-all-matches-req') {
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
})();
