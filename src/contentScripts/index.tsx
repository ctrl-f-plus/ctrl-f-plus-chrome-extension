// src/contentScripts/index.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.createElement('div');
document.body.appendChild(root);

const reactRoot = createRoot(root);

reactRoot.render(<App />);
