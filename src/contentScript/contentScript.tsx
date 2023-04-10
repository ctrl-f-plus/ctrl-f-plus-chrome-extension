// start/src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// import { Messages } from '../utils/messages';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
// import './contentScript.css';
import '../tailwind.css';

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const sendMessageToBackground = () => {
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'content',
      payload: { title: document.title, innerHtml: document.body.innerHTML },
    });
  };

  const handleSubmit = (value: string) => {
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'execute-content-script',
    });
  };

  useEffect(() => {
    const innerHTML = document.title;
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'get-inner-html',
      payload: innerHTML,
    });

    // ctrl-shft-f keydown listen:
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        setShowModal((prevState) => !prevState);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  return (
    <>
      {showModal && (
        // overlay-card
        <div className="fixed left-5 top-5 z-50 bg-purple-500">
          {' '}
          <DraggableModal>
            <SearchInput onSubmit={handleSubmit} />
          </DraggableModal>
        </div>
      )}
    </>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
