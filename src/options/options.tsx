import React from 'react';
import { createRoot } from 'react-dom/client';
import './options.css';

function App() {
  return (
    <div>
      <h1>Options Page</h1>
    </div>
  );
}

const root = document.createElement('div');
document.body.appendChild(root);

const reactRoot = createRoot(root);
reactRoot.render(<App />);
