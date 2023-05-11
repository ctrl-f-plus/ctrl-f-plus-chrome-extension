//@ts-nocheck

  Add test code:
    - ```js
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'get-all-matches-req' });
      });
    ```

- Review: https://stackoverflow.com/questions/73089998/how-to-refactor-global-variables-from-mv2-to-using-chrome-storage-in-mv3-service

- Review and potentially add "busy" to the storage utility. I also think you may be able to abstract more code out of the contentScript and into the storage util
    - : https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension


- check if you need all of the imported fontawesome icon packages

- Analyze runtime performance: https://developer.chrome.com/docs/devtools/performance/

- https://betterprogramming.pub/building-chrome-extensions-communicating-between-scripts-75e1dbf12bb7

- https://stackoverflow.com/questions/23208134/avoid-dynamically-injecting-the-same-script-multiple-times-when-using-chrome-tab

- https://stackoverflow.com/questions/40616272/an-import-path-cannot-end-with-ts-nodejs-and-visual-code

- https://stackoverflow.com/questions/71302950/import-functions-into-background-js-file-chrome-extension

- https://stackoverflow.com/questions/54668979/tell-background-script-when-content-script-injected-with-react

INSPO FOR PROMO MATERIALS TOO:
- https://www.bekk.christmas/post/2020/12/creating-a-chrome-extension-with-react-and-typescript

- https://www.reddit.com/r/reactjs/comments/kbiv6i/creating_a_chrome_extension_with_react_and/

- https://www.reddit.com/r/reactjs/comments/kbiv6i/creating_a_chrome_extension_with_react_and/

- Look at some boilerplates and make sure everything is organized and designed well
    - https://github.com/lxieyang/chrome-extension-boilerplate-react


- Look into opmtimizing the search algorithm:
    - https://dev.to/akhilpokle/the-algorithm-behind-ctrl-f-3hgh


DOM ELEMENTS TO LOCAL STORAGE:
    - https://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements

    - https://stackoverflow.com/questions/66189506/saving-dom-element-into-localstorage


- Tips for using the Chrome Web Store:
    - https://support.google.com/chrome_webstore/answer/1050673?visit_id=638174638501656455-168292003&p=cws_badges&rd=1#cws_badges&zippy=%2Cunderstand-chrome-web-store-badges
    - https://developer.chrome.com/docs/webstore/best_practices/


- FIX: if you have two tabs and you search, but then you close one or move it to its own window, then the next feature doestn' cycle back to the beginning (first match) properly.


- Fix: if findValue === ' '
    - Make the functionality match that of the native broswer find. test for difference on benjamin-chavez.com

- FIX: restore highlights if single tab reloaded
- Fix: if you search a value and you aren't on the very first tab, then the globalIndex value should not show 1, it should show the starting point for that tab

- FIX: if no matches are found, the searchLayover just closes. this should not happen

- FIX: match total should be window specific. probably need to fix the context
- fix: when no matches or when search string === "", be sure to set count to 0
