// src/contentScript/contentScript.tsx

import { isEqual } from 'lodash';
import React, { useCallback, useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { TabStore } from '../background/store';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
import {
  TabStateContext,
  TabStateContextProvider,
} from '../contexts/TabStateContext';
import { useFindMatches } from '../hooks/useFindMatches';
import { useMessageHandler } from '../hooks/useMessageHandler';
import '../tailwind.css';
import { MessageFixMe, UpdateTabStatesObjMsg } from '../types/message.types';
import {
  SerializedTabState,
  ValidTabId,
  XPathTabState,
} from '../types/tab.types';
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
import { injectStyles } from '../utils/styleUtils';
import contentStyles from './contentStyles';

const App: React.FC<{}> = () => {
  injectStyles(contentStyles);
  const {
    showLayover,
    setShowLayover,
    searchValue,
    setSearchValue,
    lastSearchValue,
    setLastSearchValue,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
    layoverPosition,
    setLayoverPosition,
    activeTabId,
    setActiveTabId,
  } = useContext(LayoverContext);
  const { tabStateContext, setTabStateContext } = useContext(TabStateContext);
  const { updateHighlights, findAllMatches } = useFindMatches();

  const updateContextFromStore = async (
    tabStore: TabStore,
    tabId: ValidTabId
  ) => {
    setSearchValue(tabStore.searchValue);
    setLastSearchValue(tabStore.lastSearchValue);
    setShowLayover(tabStore.showLayover);
    setShowMatches(tabStore.showMatches);
    setTotalMatchesCount(tabStore.totalMatchesCount);
    setLayoverPosition(tabStore.layoverPosition);

    const serializedTabState = tabStore.serializedTabState;
    const xPathTabState: XPathTabState =
      deserializeMatchesObj(serializedTabState);

    const tabState = restoreHighlightSpans(xPathTabState);

    if (!isEqual(tabState, tabStateContext)) {
      setTabStateContext(tabState);
    }

    setActiveTabId(tabStore.activeTabId);
  };

  let lastProcessedTransactionId = '0'; //FIXME: Should this be state?

  const handleMessage = useCallback(
    async (message: MessageFixMe, sender: any, sendResponse: any) => {
      console.log('Received message:', message);

      const { type, command, transactionId } = message;

      if (transactionId && transactionId <= lastProcessedTransactionId) {
        console.log('Ignoring message:', message);
        return;
      }

      let findValue;
      let tabId;
      let response;
      let newState;

      switch (type) {
        case 'remove-all-highlight-matches':
          removeAllHighlightMatches();
          sendResponse({ success: true });
          break;
        case 'store-updated':
          const { tabStore } = message.payload;
          ({ tabId } = message.payload);

          updateContextFromStore(tabStore, tabId);
          break;
        case 'highlight':
          ({ tabId, findValue } = message.payload);

          newState = await findAllMatches(tabStateContext, findValue);
          newState.tabId = tabId;

          let hasMatch = newState.matchesObj.length > 0;

          // const serializedState: SerializedTabState = serializeMatchesObj({
          //   ...newState,
          // });

          // response = {
          //   hasMatch: newState.matchesObj.length > 0,
          //   serializedState: serializedState,
          // };

          if (hasMatch && !message.foundFirstMatch) {
            newState = updateHighlights(newState, { endOfTab: false });
            hasMatch = true;
          }

          if (!isEqual(newState, tabStateContext)) {
            setTabStateContext(newState);
          }

          // newState = updateHighlights(newState, { endOfTab: false });
          const serializedState = serializeMatchesObj(newState);
          // const serializedState: SerializedTabState = serializeMatchesObj({
          //   ...newState,
          // });

          response = {
            serializedState,
            hasMatch,
          };

          // if (!isEqual(newState, tabStateContext)) {
          //   setTabStateContext(newState);
          // }

          sendResponse(response);
          return true;

        case 'update-highlights':
          ({ tabId } = message.payload);

          newState = updateHighlights(
            { ...tabStateContext, tabId },
            { endOfTab: false }
          );

          if (!isEqual(newState, tabStateContext)) {
            setTabStateContext(newState);
          }

          const newSerializedState = serializeMatchesObj(newState);

          sendMsgToBackground<UpdateTabStatesObjMsg>({
            from: 'content:match-utils',
            type: 'update-tab-states-obj',
            payload: { serializedState: newSerializedState },
          });

          sendResponse({ status: 'success' });
          return true;

        default:
          break;
      }
      return true;
    },
    [
      tabStateContext,
      updateHighlights,
      setTabStateContext,
      LayoverContext,

      showLayover,
      searchValue,
      lastSearchValue,
      showMatches,
      totalMatchesCount,
      layoverPosition,
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

  useEffect(() => {
    return () => {
      if (showMatches) {
        removeAllHighlightMatches();
      }
    };
  }, [showMatches]);

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

  return (
    <>
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
};

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
