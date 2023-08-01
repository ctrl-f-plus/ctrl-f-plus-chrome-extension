import React from 'react';
import { createRoot } from 'react-dom/client';
import { LayoverProvider } from '../contexts/LayoverContext';
import { TabStateContextProvider } from '../contexts/TabStateContext';
import Layover from './Layover';
import shadowStyles from './tailwindStyles.shadow.css';

const shadowHost = document.createElement('div');
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
