// @ts-nocheck
import React, { Profiler } from 'react';
import { createRoot } from 'react-dom/client';
import '../../tailwind.css'; // ***
import { LayoverProvider } from '../contexts/LayoverContext';
import { TabStateContextProvider } from '../contexts/TabStateContext';
import Layover from './Layover';

const root = document.createElement('div');
document.body.appendChild(root);

const reactRoot = createRoot(root);

function onRender(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(id, phase, actualDuration, baseDuration, startTime, commitTime);
}

reactRoot.render(
  <React.StrictMode>
    <TabStateContextProvider>
      <LayoverProvider>
        <Profiler id="App" onRender={onRender}>
          <Layover />
        </Profiler>
      </LayoverProvider>
    </TabStateContextProvider>
  </React.StrictMode>
);
