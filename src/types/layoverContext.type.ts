// src/interfaces/layoverContext.type.ts

import { ReactNode } from 'react';

export interface LayoverContextData {
  showLayover: boolean;
  setShowLayover: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSearchLayover: (forceShowLayover?: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  showMatches: boolean;
  setShowMatches: React.Dispatch<React.SetStateAction<boolean>>;
  totalMatchesCount: number;
  setTotalMatchesCount: React.Dispatch<React.SetStateAction<number>>;
  globalMatchIdx: number;
  setglobalMatchIdx: React.Dispatch<React.SetStateAction<number>>;
}

export interface LayoverProviderProps {
  children: ReactNode;
}
