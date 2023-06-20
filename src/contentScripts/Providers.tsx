// src/contentScripts/Providers.tsx

import React from 'react';
import { LayoverProvider } from '../contexts/LayoverContext';
import { TabStateContextProvider } from '../contexts/TabStateContext';

type Props = {
  children: React.ReactNode;
};

function Providers({ children }: Props) {
  return (
    <React.StrictMode>
      <TabStateContextProvider>
        <LayoverProvider>{children}</LayoverProvider>
      </TabStateContextProvider>
    </React.StrictMode>
  );
}

export default Providers;
