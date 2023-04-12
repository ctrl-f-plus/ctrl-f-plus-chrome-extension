- the `cntrl-shift-f` keyboard command doesn't work if caps lock is on
- Add test code:
    - ```js
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'get-all-matches-req' });
      });
    ```
