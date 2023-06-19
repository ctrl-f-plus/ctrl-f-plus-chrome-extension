//@ts-nocheck

what would these look like if they were corrected?

```
const myFunc = function() {
  return 'Hello, world!';
}

```

```
const obj = {
  x: x,
  y: y,
  myFunc: function() {
    return 'Hello, world!';
  },
};
```


Testing Packages:
@babel/plugin-transform-runtime
@babel/runtime
babel-jest
ts-jest
ts-node

Add test code: - `js
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'get-all-matches-req' });
      });
    `

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

DOM ELEMENTS TO LOCAL STORAGE: - https://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements

    - https://stackoverflow.com/questions/66189506/saving-dom-element-into-localstorage

- Tips for using the Chrome Web Store:

  - https://support.google.com/chrome_webstore/answer/1050673?visit_id=638174638501656455-168292003&p=cws_badges&rd=1#cws_badges&zippy=%2Cunderstand-chrome-web-store-badges
  - https://developer.chrome.com/docs/webstore/best_practices/

  - https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md

 <!--// ESLINT: -->
<!-- //- FIX: if no matches are found, the searchLayover just closes. this should not happen -->

<!-- //- Fix: if findValue === ' '
   // - Make the functionality match that of the native broswer find. test for difference on benjamin-chavez.com -->

<!-- //- FIX: restore highlights if single tab reloaded -->
<!-- //- fix: when no matches or when search string === "", be sure to set count to 0 -->
<!-- //- FIX: there are some bugs around the style being injected or not - might be better to leave style injected and remove spans instead of removing style and leaving spans. this will fix any weird spacing that could occur as well. -->
<!-- //- Remove all matches on hard reset or at least don't show them -->
<!-- //- showMatches is getting stuck sometimes without showLayover and sometimes showMatches won't toggle off -->
<!-- //- NextMatch() doesn't send updated state to background ever -->
<!-- //- Escape key doesn't work quite right. i think it only toggles one thing in the background script maybe. review it. -->
<!-- //- Update Store to hold windows -->
<!-- //- Add PrevMatch logic -->
<!-- //- `htmlUtils.ts`
  <!-- //- remove `@ts-ignore` -->
  <!-- //- remove `any` types --> -->
  <!-- //- You might be injecting the style a bunch of times on each page -->\

- FIX: if you have two tabs and you search, but then you close one or move it to its own window, then the next feature doestn' cycle back to the beginning (first match) properly.
- FIX: if new tab is created automatically update the search count
- Fix: if you search a value and you aren't on the very first tab, then the globalIndex value should not show 1, it should show the starting point for that tab
- FIX: match total should be window specific. probably need to fix the context
  - FIXME: double check what html code is being searched, i think we are also searching within the extension's `id="cntrl-f-extension"` which we don't need to do
- TabId is getting reset to undefined in `newState2`
- - If you search an empty string twice, then you get `NaN/0`. fix this
  - On close, and/or shutdown, etc make sure all styles, Layover, etc are gone. I had a bug showing up at some point where the other window had a layover stuck open
<!-- -// Fix styling so that it is consistent accross pages -->

- add `.eslintignore` file?
- Add Error Handling
- Potentially consolidate showMatches and showLayover
- Add Testing
- Remove all `// @ts-ignore`, `// @ts-no-check`, and `debugger` usage
- Review/Remove `any` types
- Go through messaging
  - add sync/async
  - catch all promises
  - cleanup sendMessageToContentScripts.ts file
  - Consolidate `sendMessageToBackground()` and `sendMsgToBackground()` in `sendMessageToBackground.ts`
- Storage
    - clean up storagUtils
    - updated all updates to store so that they also write to chrome storage

- `BackgroundUtils.ts`
  - General/Complete refactor

<!-- //- Look into updating the codebase with the `activeTab` permission. You might be able to clean a few things up through using the permission. -->
- Currently the `@benjamin-chavez` line on your Youtube profile doesn't add the `ctrl-f-highlight-focus` class for some reason:
  - `https://www.youtube.com/channel/UC6bQ5cJIHV0f7PeQNsorQhg`
  - This part of your github profile doesn't work either: `Listen Here: aminchavez.com`
- When switching tabs manually, the current index in the searchInput changes, but maybe it shouldn't

- I don't think you actually need this package: `"@tailwindcss/forms": "^0.5.3",`

Notes from: `replace-layover-with-popup` branch:
  - https://github.com/bmchavez/Cntrl-F/tree/bdc5ccdd56d0246a1db978d59023679ff4ba1743
  - https://github.com/bmchavez/Cntrl-F/blob/bdc5ccdd56d0246a1db978d59023679ff4ba1743/src/static/manifest.json


  - inspo:
    - https://motion.dev/tools
    - https://chrome.google.com/webstore/detail/motion-devtools/mnbliiaiiflhmnndmoidhddombbmgcdk

  - Iframe:
    - https://itnext.io/create-chrome-extension-with-reactjs-using-inject-page-strategy-137650de1f39#6186


- Double check styling leakage:
  - https://thebyteseffect.com/posts/crx-extractor-features/
