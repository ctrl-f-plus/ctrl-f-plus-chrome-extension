function highlightWord(searchText: string) {
  const body = document.getElementsByTagName('body')[0];
  const regex = new RegExp(searchText, 'gi');
  const matches = body.textContent.match(regex);

  if (matches && matches.length > 0) {
    const range = document.createRange();
    const sel = window.getSelection();
    const nodeFilter = {
      acceptNode: function (node) {
        return node.nodeType === Node.TEXT_NODE
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    };
    const treeWalker = document.createTreeWalker(
      body,
      NodeFilter.SHOW_TEXT,
      nodeFilter,
      false
    );

    let matchIndex = 0;
    let nodeIndex = 0;
    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;
      const nodeText = node.textContent;
      const matchStartIndex = nodeText
        .toLowerCase()
        .indexOf(searchText.toLowerCase(), matchIndex);
      if (matchStartIndex !== -1) {
        nodeIndex++;
        const startIdx = matchStartIndex;
        const endIdx = matchStartIndex + searchText.length;
        range.setStart(node, startIdx);
        range.setEnd(node, endIdx);
        const mark = document.createElement('mark');
        mark.style.backgroundColor = 'yellow';
        range.surroundContents(mark);
        matchIndex = endIdx;
      } else {
        matchIndex = 0;
      }
    }
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'highlight_word') {
    highlightWord(message.word);
  }
});
