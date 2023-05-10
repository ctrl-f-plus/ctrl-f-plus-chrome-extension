// src/interfaces/message.types.ts

import { Store } from '../background/store';
import { LayoverPosition } from '../components/Layover';
import { TabState, SerializedTabState, ValidTabId } from './tab.types';

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
  type: string;
  payload?: any;
  serializedState2?: any;
  serializedState?: any;
}

export interface GetAllMatchesMessage extends BaseMessage {
  from: 'content';
  type: 'get-all-matches-msg';
  payload: string;
}
export interface NextMatchMsg extends BaseMessage {
  from: 'background:backgroundUtils';
  type: 'next-match';
}

export interface PrevMatchMsg extends BaseMessage {
  from: 'background:backgroundUtils';
  type: 'prev-match';
}

export interface NextMatchMessage extends BaseMessage {
  from: 'content';
  type: 'next-match';
  serializedState2?: SerializedTabState;
}
export interface PreviousMatchMessage extends BaseMessage {
  from: 'content';
  type: 'prev-match';
  serializedState2?: SerializedTabState;
}

export interface NextMatchMessageFromBack extends BaseMessage {
  from: 'background';
  type: 'next-match';
}

export interface RemoveStylesMessage extends BaseMessage {
  from: 'background' | 'content';
  type: 'remove_styles';
}

export interface MessageFixMe {
  type: string;
  findValue?: string;
  command?: string;
  payload?: any;
}

export interface RemoveStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'remove-styles-all-tabs';
}

export interface AddStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'add-styles-all-tabs';
}

export interface RemoveAllHighlightMatches extends BaseMessage {
  from: 'content';
  type: 'remove-all-highlight-matches';
}

export interface SwitchTabMsg extends BaseMessage {
  from: 'content-script-match-utils';
  type: 'switch-tab';
  serializedState: SerializedTabState;
  prevIndex: number | undefined;
}

export interface UpdateHighlightsMsg extends BaseMessage {
  from: 'background';
  type: 'update-highlights';
  prevIndex: number | undefined;
}
export interface SwitchedActiveTabShowLayover extends BaseMessage {
  from: 'background';
  type: 'switched-active-tab-show-layover';
}

export interface SwitchedActiveTabHideLayover extends BaseMessage {
  from: 'background';
  type: 'switched-active-tab-hide-layover';
}

export interface UpdateTabStatesObjMsg extends BaseMessage {
  from: 'content:match-utils';
  type: 'update-tab-states-obj';
  payload: any;
}

export interface UpdateStoreMsg extends BaseMessage {
  from: 'background:store';
  type: 'store-updated';
  payload: {
    store: Store;
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
  from: 'background';
  type: 'highlight';
  findValue: string;
  tabId: ValidTabId;
  tabState: {};
}

export interface ToggleStylesMsg extends BaseMessage {
  from: 'background:backgroundUtils';
  type: 'add-styles' | 'remove-styles';
}

export interface RemoveAllHighlightMatchesMsg extends BaseMessage {
  from: 'background:backgroundUtils';
  type: 'remove-all-highlight-matches';
}

export interface ToggleSearchLayoverMsg extends BaseMessage {
  from: 'background';
  type: 'toggle_search_layover';
}

export type Messages =
  | GetAllMatchesMessage
  | NextMatchMsg
  | PrevMatchMsg
  | NextMatchMessage
  | PreviousMatchMessage
  | RemoveStylesMessage
  | RemoveStylesAllTabs
  | AddStylesAllTabs
  | RemoveAllHighlightMatches
  | SwitchTabMsg
  | UpdateHighlightsMsg
  | HighlightMsg
  | SwitchedActiveTabShowLayover
  | SwitchedActiveTabHideLayover
  | UpdateTabStatesObjMsg
  | UpdateStoreMsg
  | UpdateLayoverPositionMsg
  | ToggleStylesMsg
  | RemoveAllHighlightMatchesMsg
  | ToggleSearchLayoverMsg;
