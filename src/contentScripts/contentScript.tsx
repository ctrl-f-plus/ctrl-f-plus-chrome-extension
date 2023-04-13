// ./src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
import '../tailwind.css';
import { handleKeyboardCommand } from '../utils/keyboardCommands';

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = (findValue: string) => {
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'execute-content-script',
      payload: findValue,
    });
  };

  const handleNext = () => {
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

  const toggleSearchOverlay = () => {
    setShowModal((prevState) => !prevState);
  };

  const closeSearchOverlay = () => {
    setShowModal(false);
  };

  useEffect(() => {
    // TODO: Refactor here and in the utils/keyboardCmmands.ts file
    // ctrl-shft-f keydown listen:

    // const handleKeyDown = (e: KeyboardEvent) => {
    //   if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
    //     // if (e.ctrlKey && e.shiftKey && e.key === 'F') {
    //     setShowModal((prevState) => !prevState);
    //   }
    // };

    // window.addEventListener('keydown', handleKeyDown);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearchOverlay();
      }
    };

    const handleCommandMessage = (message: { command: string }) => {
      handleKeyboardCommand(message.command, {
        toggleSearchOverlay,
        closeSearchOverlay,
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
      let foundMatch;

      if (message.type === 'next-match') {
        foundMatch = window.find(message.findValue, false, false);
      } else if (message.type === 'prev-match') {
        foundMatch = window.find(message.findValue, false, true);
      } else {
        // TODO: Review why this is getting hit so often
        // debugger;
        return;
      }

      if (foundMatch) {
        sendResponse({ hasMatch: true });
      } else {
        sendResponse({ hasMatch: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    chrome.runtime.onMessage.addListener(handleCommandMessage);
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.runtime.onMessage.addListener(handleMatchMessage);

    // Cleanup the event listeners on unmount
    return () => {
      window.addEventListener('keydown', handleKeyDown);
      chrome.runtime.onMessage.removeListener(handleCommandMessage);
      chrome.runtime.onMessage.removeListener(handleMessage);
      chrome.runtime.onMessage.removeListener(handleMatchMessage);
    };
  }, []);

  return (
    <>
      {showModal && (
        <div className="fixed left-5 top-5 z-[9999] bg-purple-500">
          {' '}
          <DraggableModal>
            <SearchInput
              onSubmit={handleSubmit}
              onNext={handleNext}
              onPrevious={handlePrevious}
              focus={showModal}
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
