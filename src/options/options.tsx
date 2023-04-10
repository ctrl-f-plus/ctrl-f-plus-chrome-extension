import React from 'react';
import ReactDOM from 'react-dom';
import './options.css';

const App: React.FC<{}> = () => {
  return (
    <div>
      <h1>Options Page</h1>
    </div>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
