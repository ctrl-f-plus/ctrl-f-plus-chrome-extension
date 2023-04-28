// src/contentScript/contentScript.tsx

import React, { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { OverlayContext, OverlayProvider } from '../contexts/OverlaytContext';
// import { TabProvider } from '../contexts/TabContext';
import { useMessageHandler } from '../hooks/useMessageHandler';
import { MessageFixMe } from '../interfaces/message.types';
import '../tailwind.css';
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { removeAllHighlightMatches } from '../utils/searchAndHighlightUtils';
import { injectStyles, removeStyles } from '../utils/styleUtils';
import contentStyles from './contentStyles';

let injectedStyle: HTMLStyleElement;

const App: React.FC<{}> = () => {
  const {
    showOverlay,
    setShowOverlay,
    toggleSearchOverlay,
    searchValue,
    setSearchValue,
    showMatches,
    setShowMatches,
    totalMatchesCount,
    setTotalMatchesCount,
  } = useContext(OverlayContext);

  const handleMessage = (
    message: MessageFixMe,
    sender: any,
    sendResponse: any
  ) => {
    console.log('Received message:', message);

    const { type, findValue, command } = message;

    switch (type) {
      case 'switched-active-tab-show-overlay':
        // TODO:(*99) Alternatively, you can update toggleSearchOverlay() to take an optional argument: toggleSearchOverlay(true)
        // toggleSearchOverlay(true);
        showMatches && setShowOverlay(true);
        break;
      case 'switched-active-tab-hide-overlay':
        // toggleSearchOverlay(false);
        showMatches && setShowOverlay(false);
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
      default:
        if (command) {
          handleKeyboardCommand(command, {
            toggleSearchOverlay,
          });
        }
        break;
    }
  };

  useMessageHandler(handleMessage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOverlay) {
        toggleSearchOverlay(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showOverlay, searchValue]);

  return (
    <>
      {showOverlay && (
        <div id="cntrl-f-extension">
          <div className="fixed left-5 top-10 z-[9999] w-screen">
            {' '}
            <Layover>
              <SearchInput
                focus={showOverlay}
                onSearchValueChange={setSearchValue}
              />
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
    <OverlayProvider>
      {/* <TabProvider> */}
      <App />
      {/* </TabProvider> */}
    </OverlayProvider>
  </React.StrictMode>,
  root
);
