// src/contentScript/contentScript.tsx

import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { LayoverContext, LayoverProvider } from '../contexts/LayoverContext';
import { useMessageHandler } from '../hooks/useMessageHandler';
import { MessageFixMe } from '../interfaces/message.types';
import '../tailwind.css';
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { removeAllHighlightMatches } from '../utils/searchAndHighlightUtils';
import { injectStyles, removeStyles } from '../utils/styleUtils';
import contentStyles from './contentStyles';

let injectedStyle: HTMLStyleElement;

const App: React.FC<{}> = () => {
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const {
    showLayover,
    setShowLayover,
    toggleSearchLayover,
    searchValue,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
    globalMatchIdx,
    setglobalMatchIdx,
  } = useContext(LayoverContext);

  const handleMessage = (
    message: MessageFixMe,
    sender: any,
    sendResponse: any
  ) => {
    console.log('Received message:', message);

    const { type, findValue, command } = message;

    switch (type) {
      case 'switched-active-tab-show-layover':
        showMatches && setShowLayover(true);
        break;
      case 'switched-active-tab-hide-layover':
        showMatches && setShowLayover(false);
        break;
      case 'remove-styles':
        removeStyles(injectedStyle);
        // setShowMatches(false);
        break;
      case 'add-styles':
        injectedStyle = injectStyles(contentStyles);
        // setShowMatches(true);
        break;
      case 'remove-all-highlight-matches':
        removeAllHighlightMatches();
        sendResponse({ success: true });
        break;
      case 'update-matches-count':
        setTotalMatchesCount(message.payload.totalMatchesCount);
        break;
      case 'store-updated':
        const { store, tabState } = message.payload;

        setTotalMatchesCount(store.totalMatchesCount);
        setglobalMatchIdx(store.globalMatchIdx + 1);
        setShowLayover(store.showLayover);
        setShowMatches(store.showMatches);

        // FIXME: Make sure this value is getting updated in the store
        if (store.activeTab) {
          setActiveTabId(store.activeTab.id);
        }

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
ReactDOM.render(
  <React.StrictMode>
    <LayoverProvider>
      <App />
    </LayoverProvider>
  </React.StrictMode>,
  root
);
