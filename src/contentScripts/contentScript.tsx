// src/contentScript/contentScript.tsx

import { isEqual } from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TabStore } from '../background/store';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
import { useFindMatches } from '../hooks/useFindMatches';
import { useMessageHandler } from '../hooks/useMessageHandler';
import '../tailwind.css';
import { MessageFixMe, UpdateTabStatesObjMsg } from '../types/message.types';
import {
  SerializedTabState,
  TabId,
  TabState,
  ValidTabId,
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
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);

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
    state2Context,
    setState2Context,
  } = useContext(LayoverContext);

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
    // const xPathTabState: XPathTabState =
    const xPathTabState = deserializeMatchesObj(serializedTabState);

    const tabState = restoreHighlightSpans(xPathTabState);

    if (!isEqual(tabState, state2Context)) {
      setState2Context({ type: 'SET_STATE2_CONTEXT', payload: tabState });
    }

    setActiveTabId(tabStore.activeTabId);
  };

  async function handleHighlight(
    state2: TabState,
    findValue: string,
    tabId: TabId
  ): Promise<any> {
    state2.tabId = tabId;
    const newState = await findAllMatches(state2, findValue);

    newState.tabId = tabId;

    const serializedState: SerializedTabState = serializeMatchesObj({
      ...newState,
    });

    return {
      hasMatch: newState.matchesObj.length > 0,
      serializedState: serializedState,
      state2: newState,
    };
  }

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
      let state2;
      let tabId;
      let response;

      switch (type) {
        case 'remove-all-highlight-matches':
          removeAllHighlightMatches();
          sendResponse({ success: true });
          break;
        case 'store-updated':
          const { tabStore } = message.payload;
          tabId = message.payload.tabId;

          updateContextFromStore(tabStore, tabId);
          break;
        case 'highlight':
          tabId = message.tabId;
          state2 = { ...state2Context, tabId: tabId };
          findValue = message.findValue as string;
          response = await handleHighlight(state2, findValue, tabId);
          state2 = response.state2;

          if (response.hasMatch && !message.foundFirstMatch) {
            if (!isEqual(state2, state2Context)) {
              setState2Context({ type: 'SET_STATE2_CONTEXT', payload: state2 });
            }

            state2 = updateHighlights(state2, message.prevIndex, false);

            const serializedState: SerializedTabState = serializeMatchesObj({
              ...state2,
            });

            response = {
              ...response,
              serializedState: serializedState,
              hasMatch: true,
            };
          }

          if (!isEqual(state2, state2Context)) {
            setState2Context({ type: 'SET_STATE2_CONTEXT', payload: state2 });
          }

          sendResponse(response);
          return true;
        case 'update-highlights':
          tabId = message.payload.tabId;
          state2 = { ...state2Context, tabId: tabId };
          const newState = updateHighlights(state2, message.prevIndex, false);

          if (!isEqual(state2, state2Context)) {
            setState2Context({ type: 'SET_STATE2_CONTEXT', payload: newState });
          }

          const newSerializedState = serializeMatchesObj({
            ...newState,
          });

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
      handleHighlight,
      state2Context,
      updateHighlights,
      setState2Context,
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
      if (showMatches && activeTabId === state2Context.tabId) {
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
            <Layover activeTabId={activeTabId}>
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
    <LayoverProvider>
      <App />
    </LayoverProvider>
  </React.StrictMode>
);

// useEffect(() => {
//   console.log('state2Context updated: ', state2Context);
// }, [state2Context]);

// useEffect(() => {
//   console.log('totalMatchesCount updated: ', totalMatchesCount);
// }, [totalMatchesCount]);
