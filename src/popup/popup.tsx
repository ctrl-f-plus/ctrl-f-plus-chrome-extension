// src/popup/popup.tsx

import React, { useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SearchInput from '../components/SearchInput';
import SearchInput2 from '../components/SearchInput2';
import '../tailwind.css';
import './popup.css';

import { Store } from '../background/store';
import Layover from '../components/Layover';

import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
import { useMessageHandler } from '../hooks/useMessageHandler';
import '../tailwind.css';
import { MessageFixMe } from '../types/message.types';
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { removeAllHighlightMatches } from '../utils/matchUtils/highlightUtils';
import { injectStyles, removeStyles } from '../utils/styleUtils';
import contentStyles from '../contentScripts/contentStyles';

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
  } = useContext(LayoverContext);

  const updateContextFromStore = (store: Store) => {
    // setSearchValue(store.searchValue);
    // setLastSearchValue(store.lastSearchValue);

    setShowLayover(store.showLayover);
    setShowMatches(store.showMatches);
    setTotalMatchesCount(store.totalMatchesCount);
    setGlobalMatchIdx(store.globalMatchIdx + 1);
    setLayoverPosition(store.layoverPosition);

    // TODO: Make sure this value is getting updated in the store
    if (store.activeTab) {
      setActiveTabId(store.activeTab.id);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        margin: 0;


      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleMessage = (
    message: MessageFixMe,
    sender: any,
    sendResponse: any
  ) => {
    console.log('Received message:', message);

    const { type, command } = message;

    switch (type) {
      case 'switched-active-tab-show-layover':
        showMatches && setShowLayover(true);
        break;
      case 'switched-active-tab-hide-layover':
        showMatches && setShowLayover(false);
        break;
      case 'remove-styles':
        removeStyles(injectedStyle);
        setShowMatches(false);
        break;
      case 'add-styles':
        injectedStyle = injectStyles(contentStyles);
        setShowMatches(true);
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
        updateContextFromStore(store);
        break;
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

  return (
    <>
      <div id="cntrl-f-extension">
        <div className="min-w-[434px]">
          <SearchInput />
        </div>
      </div>
    </>
  );
};

// const root = document.createElement('div');
// document.body.appendChild(root);

// const reactRoot = createRoot(root);
// reactRoot.render(<App />);

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
