// src/interfaces/message.types.ts

import { Direction, LayoverPosition } from '../../shared/types/shared.types';
import { SerializedTabState } from './tab.types';

interface BaseMessage {
  async?: boolean;
  payload?: unknown;
}

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

export type ToBackgroundMessage =
  | GetAllMatchesMsg
  | RemoveAllHighlightMatchesMsg
  | RemoveAllStylesMsg
  | SwitchTabMsg
  | UpdatedTabStateMsg
  | UpdateLayoverPositionMsg;
