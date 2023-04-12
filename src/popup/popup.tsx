// To return the list of matches on the current tab, run the following in the popup console:
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { type: 'get-allMatches' });
// });

import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';

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
