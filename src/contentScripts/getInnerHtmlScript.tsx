// src/contentScripts/getInnerHtmlScript.tsx

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  findAllMatches,
  nextMatch,
  previousMatch,
  updateHighlights,
} from '../utils/matchUtils';
import { TabsContext, TabsProvider } from '../contexts/TabsContext';

const GetInnerHtmlScriptComponent: React.FC = () => {
  useEffect(() => {
    if (window.myUniqueExtensionFlag) {
      console.log('Content script already injected. Exiting...');
      return;
    }

    // Set the unique flag to indicate that the content script has been injected
    window.myUniqueExtensionFlag = true;

    const state = {
      currentIndex: undefined,
      matchesObj: [],
      tabId: undefined,
    };

    const state2 = {
      currentIndex: undefined,
      matchesObj: [],
      tabId: undefined,
    };

    console.log(new Date().toLocaleString());

    chrome.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        console.log("Rec'd msg:", message);

        const { from, type, findValue, tabId, messageId } = message;

        switch (`${from}:${type}`) {
          case 'background:highlight':
            state.tabId = message.tabId;
            state2.tabId = message.tabId;

            await findAllMatches(state2, findValue);
            debugger;

            // TODO: UPDATE TO SEND state2 INSTEAD OF state
            sendResponse({
              hasMatch: state2.matchesObj.length > 0,
              state: state,
            });

            return true;
          case 'background:next-match':
            if (state2.matchesObj.length > 0) nextMatch(state2);
            break;
          case 'background:prev-match':
            previousMatch(state);
            break;
          case 'background:update-highlights':
            updateHighlights(state2, message.prevIndex);
            break;
          default:
            break;
        }

        return;
      }
    );
  }, []);

  return null;
};

const root2 = document.createElement('div');
document.body.appendChild(root2);
ReactDOM.render(
  <TabsProvider>
    <GetInnerHtmlScriptComponent />
  </TabsProvider>,
  root2
);
