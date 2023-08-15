// src/background/types/message.types.ts

import { ValidTabId } from '../../contentScripts/types/tab.types';
import { Direction } from '../../shared/types/shared.types';
import { TabStore } from './Store.types';

interface BaseMessage {
  async?: boolean;
  payload?: unknown;
}

/**
 * FROM BACKGROUND TO UI
 */
export const HIGHLIGHT = 'HIGHLIGHT' as const;
export const UPDATED_STORE = 'UPDATED_STORE' as const;
export const UPDATE_HIGHLIGHTS = 'UPDATE_HIGHLIGHTS' as const;
export const REMOVE_HIGHLIGHT_MATCHES = 'REMOVE_HIGHLIGHT_MATCHES' as const;

export interface HighlightMsg extends BaseMessage {
  async: true;
  type: typeof HIGHLIGHT;
  payload: {
    tabId: ValidTabId;
    searchValue: string;
    foundFirstMatch: boolean;
  };
}

export interface UpdatedStoreMsg extends BaseMessage {
  async: true;
  type: typeof UPDATED_STORE;
  payload: {
    tabId: ValidTabId;
    tabStore?: TabStore;
    restoreHighlights: boolean;
  };
}

export interface UpdateHighlightsMsg extends BaseMessage {
  async: true;
  type: typeof UPDATE_HIGHLIGHTS;
  payload: {
    tabId: ValidTabId;
    direction: Direction;
  };
}

export interface RemoveHighlightMatchesMsg extends BaseMessage {
  async: false;
  type: typeof REMOVE_HIGHLIGHT_MATCHES;
  payload: {
    tabId: ValidTabId;
  };
}

export type ToLayoverMessage =
  | HighlightMsg
  | UpdatedStoreMsg
  | UpdateHighlightsMsg
  | RemoveHighlightMatchesMsg;
