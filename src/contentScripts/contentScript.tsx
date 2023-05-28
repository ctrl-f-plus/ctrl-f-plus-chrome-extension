// src/contentScript/contentScript.tsx

import React, { useCallback, useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Layover from '../components/Layover';
// import SearchInput from '../components/SearchInput';
import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
import {
  TabStateContext,
  TabStateContextProvider,
} from '../contexts/TabStateContext';
import useFindMatches from '../hooks/useFindMatches';
import useMessageHandler from '../hooks/useMessageHandler';
import useSearchHandler from '../hooks/useSearchHandler';
import '../tailwind.css';
import { TabStore } from '../types/Store.types';
import { Messages } from '../types/message.types';
import { XPathTabState } from '../types/tab.types';
import {
  deserializeMatchesObj,
  restoreHighlightSpans,
  serializeMatchesObj,
} from '../utils/htmlUtils';
import { removeAllHighlightMatches } from '../utils/matchUtils/highlightUtils';
import {
  sendMessageToBackground,
  sendMsgToBackground,
} from '../utils/messageUtils/sendMessageToBackground';
import injectStyles from '../utils/styleUtils';
import contentStyles from './contentStyles';

function App() {
  const {
    showLayover,
    setShowLayover,
    setSearchValue,
    setLastSearchValue,
    showMatches,
    setShowMatches,
    setTotalMatchesCount,
    setLayoverPosition,
    activeTabId,
    setActiveTabId,
  } = useContext(LayoverContext);
  const { tabStateContext, setTabStateContext } = useContext(TabStateContext);
  const { nextMatch, previousMatch, updateHighlights, findAllMatches } =
    useFindMatches();

  const { handleSearch } = useSearchHandler();
  const handleSearchSubmit = async (searchValue: string) => {
    // if (searchInputRef.current) {
    //   if (localSearchValue === lastSearchValue) {
    //     nextMatch();
    //   } else {
    // handleSearch(localSearchValue);
    // }
    // }

    handleSearch(searchValue);
  };

  // TODO: Review to decide if you want to handle this in another way
  function closeSearchLayover() {
    window.close();

    sendMessageToBackground({
      from: 'content',
      type: 'remove-styles-all-tabs',
    });
  }

  const updateContextFromStore = async (tabStore: TabStore) => {
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
  };

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
        console.log('Ignoring message:', message);
        return undefined;
      }

      switch (type) {
        case 'remove-all-highlight-matches':
          removeAllHighlightMatches();
          break;
        case 'store-updated': {
          const { tabStore } = message.payload;
          if (tabStore) {
            await updateContextFromStore(tabStore);
            sendResponse(true);
          }

          // return true;
          break;
        }
        case 'highlight': {
          const { findValue, foundFirstMatch } = message.payload;
          newState = await findAllMatches(
            // { ...tabStateContext, tabId },
            findValue
          );

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
          // return true;
          break;
        }
        case 'update-highlights': {
          newState = updateHighlights(
            { ...tabStateContext },
            { endOfTab: false }
          );

          setTabStateContext(newState);

          const newSerializedState = serializeMatchesObj(newState);

          sendResponse({ status: 'success', newSerializedState });
          // return true;
          break;
        }
        case 'popup-message': {
          console.log(message);

          const { action } = message.payload;

          if (action === `handleSearchSubmit`) {
            const searchValue = message.payload.searchValue;
            handleSearchSubmit(searchValue);
          } else if (action === `previousMatch`) {
            // TODO:
          } else if (action === `nextMatch`) {
            console.log('contentScript: in nextMatch case');
            await nextMatch();
            console.log('contentScript: after calling nextMatch()');
          } else if (action === `closeSearchLayover`) {
            closeSearchLayover();
          }
          // eslint-disable-next-line no-debugger
          // debugger;
          break;
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
      LayoverContext,

      // FIXME: REVIEW THESE
      // showLayover,
      // searchValue,
      // lastSearchValue,
      // showMatches,
      // totalMatchesCount,
      // layoverPosition,
      nextMatch,
      updateHighlights,

      lastProcessedTransactionId,
      removeAllHighlightMatches,
      updateContextFromStore,
      findAllMatches,

      sendMsgToBackground,
      serializeMatchesObj,
    ]
  );

  // FIXME: (***878)
  useMessageHandler(handleMessage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLayover) {
        sendMessageToBackground({
          from: 'content',
          type: 'remove-styles-all-tabs',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLayover]);

  useEffect(
    () => () => {
      if (showMatches) {
        removeAllHighlightMatches();
      }
    },
    [showMatches]
  );

  useEffect(() => {
    const handleActiveTabChange = () => {
      if (showMatches && activeTabId === tabStateContext.tabId) {
        setShowLayover(true);
      } else {
        setShowLayover(false);
      }
    };

    handleActiveTabChange();
  }, [activeTabId, showMatches]);

  useEffect(() => {
    injectStyles(contentStyles);

    chrome.runtime.sendMessage({
      type: 'create-popup',
      payload: {
        left: window.screenLeft + window.outerWidth,
        top: window.screenTop,
      },
    });
  }, []);

  return (
    <>
      {' '}
      {showLayover && (
        <div id="cntrl-f-extension">
          <div className="fixed left-5 top-10 z-[9999] w-screen">
            {' '}
            <Layover>{/* <SearchInput focus={showLayover} /> */}</Layover>
          </div>
        </div>
      )}
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
