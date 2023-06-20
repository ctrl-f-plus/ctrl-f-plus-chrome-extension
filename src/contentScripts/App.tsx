// src/contentScripts/App.tsx

import React, { useCallback, useContext } from 'react';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { LayoverContext } from '../contexts/LayoverContext';
import { TabStateContext } from '../contexts/TabStateContext';
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
  serializeMatchesObj,
} from '../utils/htmlUtils';

import removeAllHighlightMatches from '../utils/matchUtils/removeAllHighlightMatches';
import contentStyles from './contentStyles';
import Providers from './Providers';

function App() {
  const {
    showLayover,
    setShowLayover,
    setSearchValue,
    setLastSearchValue,
    setShowMatches,
    setTotalMatchesCount,
    setLayoverPosition,
    setActiveTabId,
  } = useContext(LayoverContext);
  const { tabStateContext, setTabStateContext } = useContext(TabStateContext);
  const { updateHighlights, findAllMatches } = useFindMatches();

  // TODO: review how often this is rendered
  const updateContextFromStore = useCallback(
    async (tabStore: TabStore) => {
      setSearchValue(tabStore.searchValue);
      setLastSearchValue(tabStore.lastSearchValue);
      setShowLayover(tabStore.showLayover);
      setShowMatches(tabStore.showMatches);
      setTotalMatchesCount(tabStore.totalMatchesCount);
      setLayoverPosition(tabStore.layoverPosition);
      setActiveTabId(tabStore.activeTabId);

      const { serializedTabState } = tabStore;
      const xPathTabState: XPathTabState =
        deserializeMatchesObj(serializedTabState);
      const tabState = restoreHighlightSpans(xPathTabState);

      setTabStateContext(tabState);
    },
    [
      setActiveTabId,
      setLastSearchValue,
      setLayoverPosition,
      setSearchValue,
      setShowLayover,
      setShowMatches,
      setTabStateContext,
      setTotalMatchesCount,
    ]
  );

  const lastProcessedTransactionId = '0'; // FIXME: Should this be state?

  const handleMessage = useCallback(
    async (
      message: Messages,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      console.log('Received message:', message);

      const { type, transactionId } = message;

      let newState;

      if (transactionId && transactionId <= lastProcessedTransactionId) {
        return undefined;
      }

      switch (type) {
        case 'store-updated': {
          const { tabStore } = message.payload;
          if (tabStore) {
            await updateContextFromStore(tabStore);
            sendResponse(true);
          }

          return true;
        }
        case 'remove-all-highlight-matches':
          removeAllHighlightMatches();
          break;
        case 'highlight': {
          const { findValue, foundFirstMatch } = message.payload;
          newState = await findAllMatches(findValue);

          const hasMatch = newState.matchesObj.length > 0;

          if (hasMatch && !foundFirstMatch) {
            newState = updateHighlights(newState, { endOfTab: false });
          }

          setTabStateContext(newState);

          const serializedState = serializeMatchesObj(newState);

          sendResponse({
            serializedState,
            hasMatch,
          });
          return true;
        }
        case 'update-highlights': {
          newState = updateHighlights(
            { ...tabStateContext },
            { endOfTab: false }
          );

          setTabStateContext(newState);

          const newSerializedState = serializeMatchesObj(newState);

          sendResponse({ status: 'success', newSerializedState });
          return true;
        }
        default:
          break;
      }

      return true;
    },
    [
      tabStateContext,
      setTabStateContext,
      updateHighlights,
      lastProcessedTransactionId,
      updateContextFromStore,
      findAllMatches,
    ]
  );

  // FIXME: (***878)
  useMessageHandler(handleMessage);
  useEscapeKeyDown();
  useActiveTabChange();
  useInjectStyles(contentStyles);
  useRemoveAllHighlightMatches();

  return (
    <Providers>
      {' '}
      {showLayover && (
        <div id="ctrl-f-plus-extension">
          <div className="ctrl-fixed ctrl-left-5 ctrl-top-10 ctrl-z-[9999] ctrl-w-screen">
            {' '}
            <Layover>
              <SearchInput focus={showLayover} />
            </Layover>
          </div>
        </div>
      )}
    </Providers>
  );
}

export default App;
