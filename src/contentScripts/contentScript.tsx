// src/contentScript/contentScript.tsx

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Layover from '../components/Layover';
import SearchInput from '../components/SearchInput';
import { OverlayContext } from '../contexts/Contexts';
import { useMessageHandler } from '../hooks/useMessageHandler';
import { useOverlayHandler } from '../hooks/useOverlayHandler';
import { useSearchHandler } from '../hooks/useSearchHandler';
import { MessageFixMe } from '../interfaces/message.types';
import '../tailwind.css';
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { removeAllHighlightMatches } from '../utils/searchAndHighlightUtils';
import { injectStyles, removeStyles } from '../utils/styleUtils';
import contentStyles from './contentStyles';

let injectedStyle: HTMLStyleElement;

const App: React.FC<{}> = () => {
  const {
    searchValue,
    setSearchValue,
    handleSearchSubmit,
    handleNext,
    handlePrevious,
  } = useSearchHandler();

  const { showOverlay, setShowOverlay, toggleSearchOverlay } =
    useOverlayHandler(searchValue);

  const handleMessage = (
    message: MessageFixMe,
    sender: any,
    sendResponse: any
  ) => {
    console.log('Received message:', message);

    const { type, findValue, command } = message;

    switch (type) {
      case 'switched-active-tab-show-modal':
        toggleSearchOverlay();
        break;
      case 'next-match':
      case 'prev-match':
        // debugger;
        // console.log(`(type === 'next-match' || type === 'prev-match')`);
        break;
      case 'remove-styles':
        removeStyles(injectedStyle);
        break;
      case 'add-styles':
        injectedStyle = injectStyles(contentStyles);
        break;
      case 'remove-all-highlight-matches':
        removeAllHighlightMatches();
        sendResponse({ success: true });
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
        toggleSearchOverlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showOverlay, searchValue]);

  useEffect(() => {
    console.log('showOverlay:', showOverlay);
  }, [showOverlay]);

  console.log('App component showOverlay:', showOverlay);

  return (
    <OverlayContext.Provider
      value={{ showOverlay, setShowOverlay, toggleSearchOverlay }}
    >
      {showOverlay && (
        <div id="cntrl-f-extension">
          <div className="fixed left-5 top-10 z-[9999] w-screen">
            {' '}
            <Layover>
              <SearchInput
                onSubmit={handleSearchSubmit}
                onNext={handleNext}
                onPrevious={handlePrevious}
                focus={showOverlay}
                onSearchValueChange={setSearchValue}
              />
            </Layover>
          </div>
        </div>
      )}
    </OverlayContext.Provider>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
