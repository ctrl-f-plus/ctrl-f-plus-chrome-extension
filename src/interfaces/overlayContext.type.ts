// src/interfaces/overlayContext.type.ts

import { ReactNode } from 'react';

export interface OverlayContextData {
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSearchOverlay: (forceShowOverlay?: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  showMatches: boolean;
  setShowMatches: React.Dispatch<React.SetStateAction<boolean>>;
  totalMatchesCount: number;
  setTotalMatchesCount: React.Dispatch<React.SetStateAction<number>>;
}

export interface OverlayProviderProps {
  children: ReactNode;
}
