// src/interfaces/overlayContext.type.ts

import { ReactNode } from 'react';

export interface OverlayContextData {
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSearchOverlay: (forceShowOverlay?: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export interface OverlayProviderProps {
  children: ReactNode;
}
