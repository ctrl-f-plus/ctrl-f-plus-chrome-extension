// src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
import '../tailwind.css';
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { setStoredFindValue, clearStoredMatchesObject } from '../utils/storage';
import { injectStyles, removeStyles } from '../utils/styleUtils';
import contentStyles from './contentStyles';
import { useMessageHandler } from '../hooks/useMessageHandler';
import { MessageFixMe } from '../utils/messages';
import { removeAllHighlightMatches } from '../utils/searchAndHighlightUtils';

// const injectedStyle = injectStyles(contentStyles);
let injectedStyle;

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = async (findValue: string) => {
    setStoredFindValue(findValue);

    await clearStoredMatchesObject();

    await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          from: 'content',
          type: 'remove-all-highlight-matches',
          payload: findValue,
        },
        (response) => {
          resolve(response);
        }
      );
    });

    chrome.runtime.sendMessage({
      from: 'content',
      type: 'get-all-matches-msg',
      payload: findValue,
    });
  };

  const handleNext = () => {
    console.log('contentScript - handleNext()');

    chrome.runtime.sendMessage({
      from: 'content',
      type: 'next-match',
    });
  };

  const handlePrevious = () => {
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'prev-match',
    });
  };

  // const handleSearchValueChange = (newValue: string) => {
  //   setSearchValue(newValue);
  // };

  const toggleSearchOverlay = () => {
    // debugger;
    // setShowModal((prevState) => !prevState);
    showModal ? closeSearchOverlay(searchValue) : openSearchOverlay();
  };

  const openSearchOverlay = () => {
    console.log('openSearchOverlay');
    setShowModal(true);
    chrome.runtime.sendMessage({ type: 'add-styles-all-tabs' });
  };

  const closeSearchOverlay = (searchValue: string) => {
    setShowModal(false);
    // TODO: NEED TO RUN SEARCHSUBMIT, BUT WITHOUT THE CSS INJECTION
    setStoredFindValue(searchValue);
    chrome.runtime.sendMessage({ type: 'remove-styles-all-tabs' });
  };

  const handleMessage = (
    message: MessageFixMe,
    sender: any,
    sendResponse: any
  ) => {
    console.log('Received message:', message);

    const { type, findValue, command } = message;

    if (type === 'switched-active-tab-show-modal') {
      debugger;
      setShowModal(true);
    } else if (type === 'next-match' || type === 'prev-match') {
      //  TODO: ???
    } else if (command) {
      handleKeyboardCommand(command, {
        toggleSearchOverlay,
        // closeSearchOverlay,
      });
    } else if (message.type === 'remove-styles') {
      removeStyles(injectedStyle);
      return;
    } else if (message.type === 'add-styles') {
      injectedStyle = injectStyles(contentStyles);
      return;
    } else if (message.type === 'remove-all-highlight-matches') {
      removeAllHighlightMatches();
      sendResponse({ success: true });
      return;
    }
  };

  useMessageHandler(handleMessage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        // Check if the search overlay is visible
        closeSearchOverlay(searchValue);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal, searchValue]);

  return (
    <>
      {showModal && (
        <div className="fixed left-5 top-5 z-[9999] bg-purple-500">
          {' '}
          <DraggableModal>
            <SearchInput
              onSubmit={handleSearchSubmit}
              onNext={handleNext}
              onPrevious={handlePrevious}
              focus={showModal}
              // onSearchValueChange={handleSearchValueChange}
              onSearchValueChange={setSearchValue}
              // onClose={closeSearchOverlay}
            />
          </DraggableModal>
        </div>
      )}
    </>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
