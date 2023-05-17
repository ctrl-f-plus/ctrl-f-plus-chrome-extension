import React from 'react';
import { createRoot } from 'react-dom/client';
import './options.css';
import ToggleComponent from '../hooks/utilityHooks/hookTestingComponents/ToggleComponent';
import TimeoutComponent from '../hooks/utilityHooks/hookTestingComponents/TimeoutComponent';
import DebounceComponent from '../hooks/utilityHooks/hookTestingComponents/DebounceComponent';
import DebugInformationComponent from '../hooks/utilityHooks/hookTestingComponents/DebugInformationComponent()';

const App: React.FC<{}> = () => {
  return (
    <div>
      <h1>Options Page</h1>
      {/* <ToggleComponent />
      <TimeoutComponent />
      <DebounceComponent />
      <DebugInformationComponent /> */}
    </div>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);

const reactRoot = createRoot(root);
reactRoot.render(<App />);
