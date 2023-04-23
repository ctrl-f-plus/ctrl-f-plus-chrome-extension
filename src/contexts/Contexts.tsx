// src/contexts/Contexts.tsx

import React, { ReactNode, createContext, useCallback, useState } from 'react';

interface OverlayContextData {
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSearchOverlay: () => void;
}

// interface OverlayProviderProps {
//   children: ReactNode;
// }

export const OverlayContext = createContext<OverlayContextData>({
  showOverlay: false,
  setShowOverlay: () => {},
  toggleSearchOverlay: () => {},
});

// export const OverlayProvider: React.FC<OverlayProviderProps> = ({
//   children,
// }) => {
//   const [showOverlay, setShowOverlay] = useState<boolean>(false);

//   const toggleSearchOverlay = useCallback(() => {
//     // debugger;
//     setShowOverlay((prevState) => !prevState);
//   }, []);

//   return (
//     <OverlayContext.Provider
//       value={{ showOverlay, setShowOverlay, toggleSearchOverlay }}
//     >
//       {children}
//     </OverlayContext.Provider>
//   );
// };
