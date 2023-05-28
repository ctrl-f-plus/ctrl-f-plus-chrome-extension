// src/popup/popup.tsx

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import InputForm from '../components/InputForm';
import { LayoverProvider } from '../contexts/LayoverContext';
import { TabStateContextProvider } from '../contexts/TabStateContext';
import '../tailwind.css';
import injectStyles from '../utils/styleUtils';
import popupStyles from './popupStyles';
import { sendMessageToBackground } from '../utils/messageUtils/sendMessageToBackground';

function App() {
  useEffect(() => {
    injectStyles(popupStyles);

    sendMessageToBackground({
      from: 'popup',
      type: 'pop-up-init',
    });
  }, []);

  return (
    <div id="cntrl-f-extension" className="popup ">
      <div className="w-[434px] h-full ">
        <InputForm />
      </div>
    </div>
  );
}

const root = document.createElement('div');
document.body.appendChild(root);
const reactRoot = createRoot(root);

reactRoot.render(
  <React.StrictMode>
    <TabStateContextProvider>
      <LayoverProvider>
        <App />
      </LayoverProvider>
    </TabStateContextProvider>
  </React.StrictMode>
);
