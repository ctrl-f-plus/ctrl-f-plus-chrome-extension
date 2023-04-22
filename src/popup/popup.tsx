// src/popup/popup.tsx

import React from 'react';
import ReactDOM from 'react-dom';


const App: React.FC<{}> = () => {
  return (
    <div>
      <h1>Popup!</h1>
    </div>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
