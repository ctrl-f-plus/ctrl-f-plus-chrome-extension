// src/interfaces/message.types.ts

import { TabStore } from './Store.types';
import { Direction, LayoverPosition } from './shared.types';
import { SerializedTabState, ValidTabId } from './tab.types';

interface BaseMessage {
  async?: boolean;
  payload?: unknown;
}
/**
 * FROM UI TO BACKGROUND
 */
export const SWITCH_TAB = 'SWITCH_TAB' as const;
export const REMOVE_ALL_HIGHLIGHT_MATCHES =
  'REMOVE_ALL_HIGHLIGHT_MATCHES' as const;
export const GET_ALL_MATCHES = 'GET_ALL_MATCHES' as const;
export const REMOVE_ALL_STYLES = 'REMOVE_ALL_STYLES' as const;
export const UPDATED_TAB_STATE = 'UPDATED_TAB_STATE' as const;
export const UPDATE_LAYOVER_POSITION = 'UPDATE_LAYOVER_POSITION' as const;

export interface GetAllMatchesMsg extends BaseMessage {
  type: typeof GET_ALL_MATCHES;
  payload: { searchValue: string };
}

export interface RemoveAllHighlightMatchesMsg extends BaseMessage {
  type: typeof REMOVE_ALL_HIGHLIGHT_MATCHES;
}

export interface RemoveAllStylesMsg extends BaseMessage {
  type: typeof REMOVE_ALL_STYLES;
}

export interface SwitchTabMsg extends BaseMessage {
  type: typeof SWITCH_TAB;
  payload: {
    serializedState: SerializedTabState;
    direction: Direction;
  };
}

export interface UpdatedTabStateMsg extends BaseMessage {
  type: typeof UPDATED_TAB_STATE;
  payload: { serializedState: SerializedTabState };
}

export interface UpdateLayoverPositionMsg extends BaseMessage {
  type: typeof UPDATE_LAYOVER_POSITION;
  payload: {
    newPosition: LayoverPosition;
  };
}

export type ToBackgroundMsg =
  | GetAllMatchesMsg
  | RemoveAllHighlightMatchesMsg
  | RemoveAllStylesMsg
  | SwitchTabMsg
  | UpdatedTabStateMsg
  | UpdateLayoverPositionMsg;

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
