// src/interfaces/message.types.ts

import { TabStore } from './Store.types';
import { Direction, LayoverPosition } from './shared.types';
import { SerializedTabState, ValidTabId } from './tab.types';

export interface BaseMessage {
  from:
    | 'background'
    | 'background:store'
    | 'content'
    | 'content:match-utils'
    | 'match-utils'
    | 'inner-match-utils'
    | 'content-script-match-utils'
    | 'background:backgroundUtils'
    | 'content:layover-component';
  async?: boolean | true;
  type: string;
  // payload?: unknown; // TODO: you might need to add this back, but i think you are fine without it
  payload?: any;
}

export interface GetAllMatchesMsg extends BaseMessage {
  from: 'content';
  // type: 'GET_ALL_MATCHES';
  type: 'get-all-matches';
  payload: { searchValue: string };
}

export interface RemoveAllHighlightMatches extends BaseMessage {
  from: 'content';
  type: 'remove-all-highlight-matches';
}

export interface RemoveAllHighlightMatchesMsg extends BaseMessage {
  async: false;
  from: 'background:backgroundUtils';
  type: 'remove-all-highlight-matches';
  payload: {
    tabId: ValidTabId;
  };
}

export interface RemoveStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'remove-styles-all-tabs';
}

export interface SwitchTabMsg extends BaseMessage {
  from: 'content-script-match-utils';
  type: 'switch-tab';
  payload: {
    serializedState: SerializedTabState;
    direction: Direction;
  };
}

export interface UpdateHighlightsMsg extends BaseMessage {
  async: true;
  from: 'background';
  type: 'update-highlights';
  payload: {
    tabId: ValidTabId;
    direction: Direction;
  };
}

export interface UpdateTabStatesObjMsg extends BaseMessage {
  from: 'content:match-utils';
  type: 'update-tab-states-obj';
  payload: { serializedState: SerializedTabState };
}

export interface UpdateStoreMsg extends BaseMessage {
  async: true;
  from: 'background:store';
  type: 'store-updated';
  payload: {
    tabId: ValidTabId;
    tabStore?: TabStore;
  };
}

export interface UpdateLayoverPositionMsg extends BaseMessage {
  from: 'content:layover-component';
  type: 'update-layover-position';
  payload: {
    newPosition: LayoverPosition;
  };
}

export interface HighlightMsg extends BaseMessage {
  async: true;
  from: 'background';
  type: 'highlight';
  // TODO: change findValue to searchValue?
  payload: {
    findValue: string;
    tabId: ValidTabId;
    foundFirstMatch: boolean;
  };
}

export type Messages =
  | GetAllMatchesMsg
  | RemoveStylesAllTabs
  | RemoveAllHighlightMatches
  | RemoveAllHighlightMatchesMsg
  | SwitchTabMsg
  | UpdateHighlightsMsg
  | HighlightMsg
  | UpdateTabStatesObjMsg
  | UpdateStoreMsg
  | UpdateLayoverPositionMsg;
