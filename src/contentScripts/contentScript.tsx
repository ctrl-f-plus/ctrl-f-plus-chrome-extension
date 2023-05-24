// src/contentScript/contentScript.tsx

import React, { useCallback, useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
import {
  TabStateContext,
  TabStateContextProvider,
} from '../contexts/TabStateContext';
import useFindMatches from '../hooks/useFindMatches';
import useMessageHandler from '../hooks/useMessageHandler';
import '../tailwind.css';
import { TabStore } from '../types/Store.types';
import { Messages } from '../types/message.types';
import { ValidTabId, XPathTabState } from '../types/tab.types';
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
import scrollToElement from '../utils/scrollUtils';
import injectStyles from '../utils/styleUtils';
import contentStyles from './contentStyles';

// function App(): React.ReactElement {
// const App: React.FC<{}> = () => {
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
  const { updateHighlights, findAllMatches } = useFindMatches();

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

    // FIXME: Hacky, see if you can move this logic elsewhere
    // TODO: when switching tab forwards, we don't highlight the first match
    if (
      typeof tabState.currentIndex === 'number' &&
      tabState.matchesCount !== undefined &&
      tabState.currentIndex === tabState.matchesCount - 1
    ) {
      const curMatch = tabState.matchesObj[tabState.currentIndex];
      if (curMatch) {
        curMatch.classList.add('ctrl-f-highlight-focus');
      }
      scrollToElement(curMatch);
    }
  };

  const lastProcessedTransactionId = '0'; // FIXME: Should this be state?

  const handleMessage = useCallback(
    async (message: Messages, sender: any, sendResponse: any) => {
      console.log('Received message:', message);

      const { type, transactionId } = message;
      // const { tabId }: { tabId: ValidTabId } = message.payload;
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
            updateContextFromStore(tabStore);
          }
          sendResponse(true);
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
          return true;
        }
        // case 'update-highlights':
        //   newState = updateHighlights(
        //     { ...tabStateContext },
        //     { endOfTab: false }
        //   );

        //   setTabStateContext(newState);

        //   const newSerializedState = serializeMatchesObj(newState);

        //   sendMsgToBackground<UpdateTabStatesObjMsg>({
        //     from: 'content:match-utils',
        //     type: 'update-tab-states-obj',
        //     payload: { serializedState: newSerializedState },
        //   });

        //   sendResponse({ status: 'success' });
        //   return true;
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

      lastProcessedTransactionId,
      removeAllHighlightMatches,
      updateContextFromStore,
      findAllMatches,

      sendMsgToBackground,
      serializeMatchesObj,
    ]
  );

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

  // useEffect(() => {
  //   console.log('tabStateContext updated: ', tabStateContext);
  // }, [tabStateContext]);

  useEffect(() => {
    injectStyles(contentStyles);
  }, []);

  return (
    <>
      {' '}
      {showLayover && (
        <div id="cntrl-f-extension">
          <div className="fixed left-5 top-10 z-[9999] w-screen">
            {' '}
            <Layover>
              <SearchInput focus={showLayover} />
            </Layover>
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
