// src/interfaces/layoverContext.types.ts

import { ReactNode } from 'react';
import { TabId, TabState } from './tab.types';
import { LayoverPosition } from '../../shared/types/shared.types';

export interface LayoverContextData {
  showLayover: boolean;
  setShowLayover: (value: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  lastSearchValue: string;
  setLastSearchValue: (value: string) => void;
  showMatches: boolean;
  setShowMatches: (value: boolean) => void;
  totalMatchesCount: number;
  setTotalMatchesCount: (value: number) => void;
  globalMatchIdx: number;
  setGlobalMatchIdx: (value: number) => void;
  layoverPosition: LayoverPosition | null;
  setLayoverPosition: (value: LayoverPosition | null) => void;
  activeTabId: TabId;
  setActiveTabId: (value: TabId) => void;
  incrementMatchIndices: () => void;
}

export interface LayoverProviderProps {
  children: ReactNode;
}

export interface LayoverState {
  showLayover: boolean;
  showMatches: boolean;
  searchValue: string;
  lastSearchValue: string;
  totalMatchesCount: number;
  globalMatchIdx: number;
  layoverPosition: LayoverPosition | null;
  activeTabId: TabId;
  tabStateContext: TabState;
}

export type ActionTypes =
  | 'INITIALIZE_STATE'
  | 'SET_SHOW_LAYOVER'
  | 'SET_SHOW_MATCHES'
  | 'SET_SEARCH_VALUE'
  | 'SET_LAST_SEARCH_VALUE'
  | 'SET_TOTAL_MATCHES_COUNT'
  | 'SET_GLOBAL_MATCH_IDX'
  | 'SET_LAYOVER_POSITION'
  | 'SET_TAB_STATE_CONTEXT'
  | 'SET_ACTIVE_TAB_ID'
  | 'INCREMENT_MATCH_INDICES';

export type LayoverAction =
  | { type: 'INITIALIZE_STATE'; payload: LayoverState }
  | { type: 'SET_SHOW_LAYOVER'; payload: boolean }
  | { type: 'SET_SHOW_MATCHES'; payload: boolean }
  | { type: 'SET_SEARCH_VALUE'; payload: string }
  | { type: 'SET_LAST_SEARCH_VALUE'; payload: string }
  | { type: 'SET_TOTAL_MATCHES_COUNT'; payload: number }
  | { type: 'SET_GLOBAL_MATCH_IDX'; payload: number }
  | { type: 'SET_LAYOVER_POSITION'; payload: LayoverPosition | null }
  | { type: 'INCREMENT_MATCH_INDICES' }
  | { type: 'SET_ACTIVE_TAB_ID'; payload: TabId }
  | { type: 'SET_TAB_STATE_CONTEXT'; payload: TabState };
