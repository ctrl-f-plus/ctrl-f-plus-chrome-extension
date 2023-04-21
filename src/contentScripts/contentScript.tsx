// src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
import { useMessageHandler } from '../hooks/useMessageHandler';
import '../tailwind.css';
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { MessageFixMe } from '../interfaces/message.types';
import { removeAllHighlightMatches } from '../utils/searchAndHighlightUtils';
import { clearStoredMatchesObject, setStoredFindValue } from '../utils/storage';
import { injectStyles, removeStyles } from '../utils/styleUtils';
import contentStyles from './contentStyles';
import { Messages } from '../interfaces/message.types';

let injectedStyle: HTMLStyleElement;

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');

  const sendMessageToBackground = async (message: Messages) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  };

  const handleSearchSubmit = async (findValue: string) => {
    setStoredFindValue(findValue);

    await clearStoredMatchesObject();

    await sendMessageToBackground({
      from: 'content',
      type: 'remove-all-highlight-matches',
      payload: findValue,
    });

    sendMessageToBackground({
      from: 'content',
      type: 'get-all-matches-msg',
      payload: findValue,
    });
  };

  const handleNext = () => {
    sendMessageToBackground({
      from: 'content',
      type: 'next-match',
    });
  };

  const handlePrevious = () => {
    sendMessageToBackground({
      from: 'content',
      type: 'prev-match',
    });
  };

  const toggleSearchOverlay = () => {
    showModal ? closeSearchOverlay(searchValue) : openSearchOverlay();
  };

  const openSearchOverlay = () => {
    setShowModal(true);
    sendMessageToBackground({
      from: 'content',
      type: 'add-styles-all-tabs',
    });
  };

  const closeSearchOverlay = (searchValue: string) => {
    setShowModal(false);
    // TODO: NEED TO RUN SEARCHSUBMIT, BUT WITHOUT THE CSS INJECTION (test by typing a new value into search input then hitting `esc` key)
    setStoredFindValue(searchValue);
    sendMessageToBackground({
      from: 'content',
      type: 'remove-styles-all-tabs',
    });
  };

  const handleMessage = (
    message: MessageFixMe,
    sender: any,
    sendResponse: any
  ) => {
    console.log('Received message:', message);

    const { type, findValue, command } = message;

    switch (type) {
      case 'switched-active-tab-show-modal':
        setShowModal(true);
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
      if (e.key === 'Escape' && showModal) {
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
        <div className="cntrl-f-extension">
          {/* <div className="fixed left-5 top-5 z-[9999]"> */}
          <div className="fixed left-5 top-5 z-[9999] w-screen">
            {' '}
            <DraggableModal>
              <SearchInput
                onSubmit={handleSearchSubmit}
                onNext={handleNext}
                onPrevious={handlePrevious}
                focus={showModal}
                onSearchValueChange={setSearchValue}
                onClose={closeSearchOverlay}
              />
            </DraggableModal>
          </div>
        </div>
      )}
    </>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
