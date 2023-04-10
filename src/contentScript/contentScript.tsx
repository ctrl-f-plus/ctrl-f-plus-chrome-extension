// start/src/contentScript/contentScript.tsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Messages } from '../utils/messages';
import DraggableModal from '../components/DraggableModal';
import SearchInput from '../components/SearchInput';
import './contentScript.css';

const App: React.FC<{}> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const sendMessageToBackground = () => {
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'content',
      // payload: 'Hello from content script',
      payload: { title: document.title, innerHtml: document.body.innerHTML },
    });
  };

  // const handleMessages = (msg: Messages) => {
  //   if (msg.from === 'background' && msg.type === 'content') {
  //     console.log('Message received from background script:', msg.payload);
  //   }
  // };

  const handleSubmit = (value: string) => {
    // sendMessageToBackground();
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'execute-content-script',
    });
  };

  useEffect(() => {
    // const innerHTML = document.body.innerHTML;
    const innerHTML = document.title;
    chrome.runtime.sendMessage({
      from: 'content',
      type: 'get-inner-html',
      payload: innerHTML,
    });

    // return null;

    // chrome.runtime.onMessage.addListener(handleMessages);

    // return () => {
    //   chrome.runtime.onMessage.removeListener(handleMessages);
    // };

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

  // console.log('ContentScript now running...');

  return (
    <>
      {showModal && (
        <div className="overlayCard">
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
