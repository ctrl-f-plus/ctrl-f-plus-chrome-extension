// ./src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
import '../tailwind.css';
import { handleKeyboardCommand } from '../utils/keyboardCommands';
import { setStoredFindValue } from '../utils/storage';

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (findValue: string) => {
    setStoredFindValue(findValue);

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
    setShowModal((prevState) => !prevState);
  };

  const closeSearchOverlay = (searchValue: string) => {
    setShowModal(false);
    setStoredFindValue(searchValue);

    // TODO: unhighlight all matches
    // console.log('remove_styles');
    // chrome.runtime.sendMessage({ type: 'remove_styles' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'remove_styles' });
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        // Check if the search overlay is visible
        closeSearchOverlay(searchValue);
      }
    };

    const handleCommandMessage = (message: { command: string }) => {
      handleKeyboardCommand(message.command, {
        toggleSearchOverlay,
        // closeSearchOverlay,
      });
    };

    // Add this listener for 'tab-activated' events
    const handleMessage = (message: { type: string }) => {
      // TODO: This shouldn't happen on every new tab

      if (message.type === 'tab-activated') {
        setShowModal(true);
      }
    };

    const handleMatchMessage = (message, sender, sendResponse) => {
      console.log('contentScript - handleMatchMessage()');
      let foundMatch;

      if (message.type === 'next-match') {
        // debugger;
        console.log('contentScript - next-match');
        foundMatch = window.find(message.findValue, false, false);
      } else if (message.type === 'prev-match') {
        foundMatch = window.find(message.findValue, false, true);
      } else {
        // TODO: Review why this is getting hit so often
        // debugger;
        return;
      }
      // debugger;
      if (foundMatch) {
        console.log('contentScript - foundMatch - true');
        sendResponse({ hasMatch: true });
      } else {
        console.log('contentScript - foundMatch - false');
        sendResponse({ hasMatch: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    chrome.runtime.onMessage.addListener(handleCommandMessage);
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.runtime.onMessage.addListener(handleMatchMessage);

    // Cleanup the event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      chrome.runtime.onMessage.removeListener(handleCommandMessage);
      chrome.runtime.onMessage.removeListener(handleMessage);
      chrome.runtime.onMessage.removeListener(handleMatchMessage);
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
