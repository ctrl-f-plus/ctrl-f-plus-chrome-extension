// start/src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
import '../tailwind.css';
import { findAllMatches, nextMatch, previousMatch } from './highlighter';

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = (value: string) => {
    findAllMatches({ findValue: value });
  };

  const handleNext = () => {
    nextMatch();
  };

  const handlePrevious = () => {
    previousMatch();
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

    // Cleanup the event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <>
      {showModal && (
        // overlay-card
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
