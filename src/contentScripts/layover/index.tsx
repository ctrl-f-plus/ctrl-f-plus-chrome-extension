// src/contentScripts/layover/index.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import { LayoverProvider } from '../contexts/LayoverContext';
import { TabStateContextProvider } from '../contexts/TabStateContext';
import Layover from './Layover';
// @ts-ignore
import shadowStyles from './tailwindStyles.shadow.css';
import ctrlLogger from '../../shared/utils/ctrlLogger';

if (!window.__LAYOVER_SCRIPT_INJECTED__) {
  window.__LAYOVER_SCRIPT_INJECTED__ = true;

  const shadowHost = document.createElement('div');
  shadowHost.id = 'ctrl-f-plus-shadow-host';
  document.body.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  const root = document.createElement('div');

  shadowRoot.appendChild(root);

  const style = document.createElement('style');
  style.textContent = shadowStyles;
  shadowRoot.appendChild(style);

  const reactRoot = createRoot(root);

  reactRoot.render(
    <React.StrictMode>
      <TabStateContextProvider>
        <LayoverProvider>
          <Layover />
        </LayoverProvider>
      </TabStateContextProvider>
    </React.StrictMode>
  );

  ctrlLogger.info('Layover Injected');
} else {
  ctrlLogger.log('layover.ts: Content script already injected. Exiting...');
}
