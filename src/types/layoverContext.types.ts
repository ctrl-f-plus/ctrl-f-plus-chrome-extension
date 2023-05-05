// src/interfaces/layoverContext.types.ts

import { ReactNode } from 'react';

export interface LayoverContextData {
  showLayover: boolean;
  setShowLayover: (value: boolean) => void;
  toggleSearchLayover: (forceShowLayover?: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  showMatches: boolean;
  setShowMatches: (value: boolean) => void;
  totalMatchesCount: number;
  setTotalMatchesCount: (value: number) => void;
  globalMatchIdx: number;
  setglobalMatchIdx: (value: number) => void;
}

export interface LayoverProviderProps {
  children: ReactNode;
}

export interface LayoverState {
  showLayover: boolean;
  showMatches: boolean;
  searchValue: string;
  totalMatchesCount: number;
  globalMatchIdx: number;
}

export type LayoverAction =
  | { type: 'SET_SHOW_LAYOVER'; payload: boolean }
  | { type: 'SET_SHOW_MATCHES'; payload: boolean }
  | { type: 'SET_SEARCH_VALUE'; payload: string }
  | { type: 'SET_TOTAL_MATCHES_COUNT'; payload: number }
  | { type: 'SET_GLOBAL_MATCH_IDX'; payload: number };
