// src/contentScript/contentScript.tsx

import React, { useCallback, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
import {
  TabStateContext,
  TabStateContextProvider,
} from '../contexts/TabStateContext';
import useActiveTabChange from '../hooks/useActiveTabChange';
import useEscapeKeyDown from '../hooks/useEscapeKeydown';
import useFindMatches from '../hooks/useFindMatches';
import useInjectStyles from '../hooks/useInjectStyles';
import useMessageHandler from '../hooks/useMessageHandler';
import useRemoveAllHighlightMatches from '../hooks/useRemoveAllHighlightMatches';
import '../tailwind.css';
import { TabStore } from '../types/Store.types';
import { Messages } from '../types/message.types';
import { XPathTabState } from '../types/tab.types';
import {
  deserializeMatchesObj,
  restoreHighlightSpans,
} from '../utils/htmlUtils';

import contentStyles from './contentStyles';

console.log('cs running1');
function App() {
  console.log('cs running2');
  // const {
  //   showLayover,
  //   setShowLayover,
  //   setSearchValue,
  //   setLastSearchValue,
  //   setShowMatches,
  //   setTotalMatchesCount,
  //   setLayoverPosition,
  //   setActiveTabId,
  // } = useContext(LayoverContext);
  // const { tabStateContext, setTabStateContext } = useContext(TabStateContext);
  // const { updateHighlights, findAllMatches } = useFindMatches();

  // TODO: review how often this is rendered
  // const updateContextFromStore = useCallback(
  //   async (tabStore: TabStore) => {
  //     setSearchValue(tabStore.searchValue);
  //     setLastSearchValue(tabStore.lastSearchValue);
  //     setShowLayover(tabStore.showLayover);
  //     setShowMatches(tabStore.showMatches);
  //     setTotalMatchesCount(tabStore.totalMatchesCount);
  //     setLayoverPosition(tabStore.layoverPosition);
  //     setActiveTabId(tabStore.activeTabId);

  //     const { serializedTabState } = tabStore;
  //     const xPathTabState: XPathTabState =
  //       deserializeMatchesObj(serializedTabState);
  //     const tabState = restoreHighlightSpans(xPathTabState);

  //     setTabStateContext(tabState);
  //   },
  //   [
  //     setActiveTabId,
  //     setLastSearchValue,
  //     setLayoverPosition,
  //     setSearchValue,
  //     setShowLayover,
  //     setShowMatches,
  //     setTabStateContext,
  //     setTotalMatchesCount,
  //   ]
  // );

  // const lastProcessedTransactionId = '0'; // FIXME: Should this be state?

  // const handleMessage = useCallback(
  //   async (
  //     message: Messages,
  //     sender: chrome.runtime.MessageSender,
  //     sendResponse: (response?: any) => void
  //   ) => {
  //     console.log('Received message:', message);

  //     const { type, transactionId } = message;

  //     let newState;

  //     if (transactionId && transactionId <= lastProcessedTransactionId) {
  //       return undefined;
  //     }

  //     switch (type) {
  //       case 'store-updated': {
  //         const { tabStore } = message.payload;
  //         if (tabStore) {
  //           await updateContextFromStore(tabStore);
  //           sendResponse(true);
  //         }

  //         return true;
  //       }
  //       default:
  //         break;
  //     }

  //     return true;
  //   },
  //   [updateContextFromStore]
  // );

  // FIXME: (***878)
  // useMessageHandler(handleMessage);
  // useEscapeKeyDown();
  // useActiveTabChange();
  useInjectStyles(contentStyles);
  // useRemoveAllHighlightMatches();

  return (
    <>
      {' '}
      {/* {showLayover && (
        <div id="ctrl-f-plus-extension">
          <div className="ctrl-fixed ctrl-left-5 ctrl-top-10 ctrl-z-[9999] ctrl-w-screen">
            {' '}
            <Layover>
              <SearchInput focus={showLayover} />
            </Layover>
          </div>
        </div>
      )} */}
    </>
  );
}

const root = document.createElement('div');
document.body.appendChild(root);

const reactRoot = createRoot(root);

reactRoot.render(
  <React.StrictMode>
    <TabStateContextProvider>
      <LayoverProvider>
        <App />
      </LayoverProvider>
    </TabStateContextProvider>
  </React.StrictMode>
);
