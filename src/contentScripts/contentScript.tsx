// ./src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
import '../tailwind.css';

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = (value: string) => {
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'execute-content-script',
      payload: value,
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
      type: 'previous-match',
    });
  };

  useEffect(() => {
    // ctrl-shft-f keydown listen:
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        setShowModal((prevState) => !prevState);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Add this listener for 'tab-activated' events
    const handleMessage = (message: { type: string }) => {
      if (message.type === 'tab-activated') {
        setShowModal(true);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Add the new message listener for 'next-match' and 'previous-match' events
    const handleMatchMessage = (message, sender, sendResponse) => {
      if (message.type === 'next-match') {
        // FIXME: HERE
        const foundMatch = window.find(message.findValue, false, false);
        if (foundMatch) {
          sendResponse({ hasMatch: true });
        } else {
          sendResponse({ hasMatch: false });
        }
      } else if (message.type === 'previous-match') {
        const foundMatch = window.find(message.findValue, false, true);
        if (foundMatch) {
          sendResponse({ hasMatch: true });
        } else {
          sendResponse({ hasMatch: false });
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMatchMessage);

    // Cleanup the event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
