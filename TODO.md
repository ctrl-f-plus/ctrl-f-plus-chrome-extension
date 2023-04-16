- the `cntrl-shift-f` keyboard command doesn't work if caps lock is on
- Add test code:
    - ```js
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'get-all-matches-req' });
      });
    ```

- Review: https://stackoverflow.com/questions/73089998/how-to-refactor-global-variables-from-mv2-to-using-chrome-storage-in-mv3-service

- Review and potentially add "busy" to the storage utility. I also think you may be able to abstract more code out of the contentScript and into the storage util
    - : https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension


- Review this code:
```ts
function handleMessage(message, sender, sendResponse) {
  const { from, type } = message;

  switch (type) {
    case 'highlight':
      if (from === 'background') {
        state.tabId = message.tabId;
        findAllMatches(state, message.findValue);
      }
      break;
    case 'get-all-matches-req':
      break;
    case 'next-match':
      handleNextMatch(sendResponse);
      break;
    case 'prev-match':
      previousMatch(state);
      break;
    case 'remove_styles':
      removeStyles(injectedStyle);
      break;
    default:
      break;
  }
}

function handleNextMatch(sendResponse) {
  console.log('getInnerHtmlScript - next-match');

  if (state.matches.length > 0) {
    nextMatch(state);
    sendResponse({ hasMatch: true, tabId: state.tabId });
  } else {
    sendResponse({ hasMatch: false, tabId: state.tabId });
  }
}

chrome.runtime.onMessage.addListener(handleMessage);
```
