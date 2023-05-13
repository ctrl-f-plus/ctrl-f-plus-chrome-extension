// src/contentScript/contentScript.tsx

import React, { useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Store } from '../background/store';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
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
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { useFindMatches } from '../hooks/useFindMatches';
import { removeAllHighlightMatches } from '../utils/matchUtils/highlightUtils';
import { createUpdateTabStatesObjMsg } from '../utils/messageUtils/createMessages';
import { sendMsgToBackground } from '../utils/messageUtils/sendMessageToBackground';
import { injectStyles } from '../utils/styleUtils';
import contentStyles from './contentStyles';

let injectedStyle: HTMLStyleElement;

const App: React.FC<{}> = () => {
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);

  const {
    showLayover,
    setShowLayover,
    toggleSearchLayover,
    searchValue,
    setSearchValue,
    lastSearchValue,
    setLastSearchValue,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
    globalMatchIdx,
    setGlobalMatchIdx,
    setLayoverPosition,
    state2Context,
    setState2Context,
  } = useContext(LayoverContext);

  const { findAllMatches, updateHighlights, nextMatch } = useFindMatches();

  const updateContextFromStore = (store: Store, tabId: ValidTabId) => {
    // setSearchValue(store.searchValue);
    // setLastSearchValue(store.lastSearchValue);

    setShowLayover(store.showLayover);
    setShowMatches(store.showMatches);
    setTotalMatchesCount(store.totalMatchesCount);
    setGlobalMatchIdx(store.globalMatchIdx + 1);
    setLayoverPosition(store.layoverPosition);

    // FIXME: DRY THIS CODE
    if (store.tabStates[tabId]) {
      const serializedMatches = store.tabStates[tabId].serializedMatches;
      let tabState = deserializeMatchesObj(store.tabStates[tabId]);
      tabState = restoreHighlightSpans(tabState);
      setState2Context({ type: 'SET_STATE2_CONTEXT', payload: tabState });
    }

    // TODO: Make sure this value is getting updated in the store
    if (store.activeTab) {
      setActiveTabId(store.activeTab.id);
    }
  };

  // async function handleHighlight(
  //   state2: TabState,
  //   findValue: string,
  //   tabId: TabId,
  //   sendResponse: Function
  // ): Promise<void> {
  //   state2.tabId = tabId;
  //   debugger;

  //   await findAllMatches(state2, findValue);

  //   const serializedState: SerializedTabState = serializeMatchesObj({
  //     ...state2,
  //   });

  //   sendResponse({
  //     hasMatch: state2.matchesObj.length > 0,
  //     serializedState: serializedState,
  //   });
  // }

  async function handleHighlight(
    state2: TabState,
    findValue: string,
    tabId: TabId
  ): Promise<any> {
    state2.tabId = tabId;
    await findAllMatches(state2, findValue);

    const serializedState: SerializedTabState = serializeMatchesObj({
      ...state2,
    });

    return {
      hasMatch: state2.matchesObj.length > 0,
      serializedState: serializedState,
    };
  }

  async function handleNextMatch(
    state2: TabState,
    sendResponse: Function
  ): Promise<void> {
    if (state2.matchesObj.length > 0) await nextMatch(state2);

    const serializedState2: SerializedTabState = serializeMatchesObj({
      ...state2,
    });

    sendResponse({
      serializedState2: serializedState2,
      status: 'success',
    });
  }

  const handleMessage = async (
    message: MessageFixMe,
    sender: any,
    sendResponse: any
  ) => {
    console.log('Received message:', message, state2Context);

    const { type, command } = message;
    let serializedtabState: SerializedTabState;
    let tabState: TabState;
    let findValue;
    let state2;
    let tabId;
    let response;

    switch (type) {
      case 'switched-active-tab-show-layover':
        showMatches && setShowLayover(true);
        break;
      case 'switched-active-tab-hide-layover':
        showMatches && setShowLayover(false);
        break;
      case 'add-styles':
        injectedStyle = injectStyles(contentStyles);
        setShowMatches(true);
        serializedtabState =
          message.payload.store.tabStates[message.payload.tabId];

        if (serializedtabState === undefined) {
          break;
        }

        deserializeMatchesObj(serializedtabState);
        tabState = deserializeMatchesObj({
          ...serializedtabState,
        });

        tabState = restoreHighlightSpans(tabState);
        //FIXME: DRY and/or REFACTOR AS RESPONSE:
        const serializedState: SerializedTabState = serializeMatchesObj({
          ...tabState,
        });

        const msg = createUpdateTabStatesObjMsg(serializedState);
        sendMsgToBackground<UpdateTabStatesObjMsg>(msg);
        break;
      case 'remove-all-highlight-matches':
        removeAllHighlightMatches();
        sendResponse({ success: true });
        break;
      case 'update-matches-count':
        setTotalMatchesCount(message.payload.totalMatchesCount);
        break;
      case 'store-updated':
        const { store } = message.payload;
        tabId = message.payload.tabId;
        updateContextFromStore(store, tabId);
        break;
      case 'highlight':
        tabId = message.tabId;
        state2 = { ...state2Context, tabId: tabId };
        findValue = message.findValue as string;
        response = await handleHighlight(state2, findValue, tabId);
        sendResponse(response);
        return true;
      case 'update-highlights':
        state2 = { ...state2Context, tabId: tabId };
        // await updateHighlights(state2, message.prevIndex, false, sendResponse);
        response = await updateHighlights(
          state2,
          message.prevIndex,
          false,
          sendResponse
        );
        sendResponse(response);
        return true;
      case 'next-match':
        state2 = { ...state2Context, tabId: message.payload.tabId };
        debugger;
        await handleNextMatch(state2, sendResponse);

        return true;
      default:
        if (command) {
          handleKeyboardCommand(command, {
            toggleSearchLayover,
          });
        }
        break;
    }
  };

  useMessageHandler(handleMessage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // TODO: Should run on all stored tabs from given window
      if (e.key === 'Escape' && showLayover) {
        toggleSearchLayover(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLayover, searchValue]);

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
