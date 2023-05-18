// src/interfaces/message.types.ts

import { Store, TabStore } from '../background/store';
import { LayoverPosition } from '../components/Layover';
import { SerializedTabState, TabId, ValidTabId } from './tab.types';

export type TransactionId = Exclude<string, undefined>;

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
  payload?: any;
  serializedState2?: any;
  serializedState?: any;
  transactionId?: TransactionId;
}

export interface GetAllMatchesMsg extends BaseMessage {
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

export interface PrevMatch_msg extends BaseMessage {
  from: 'content';
  type: 'prev-match';
}

export interface NextMatch_msg extends BaseMessage {
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
  async: boolean | true;
  type: string;
  findValue?: string;
  command?: string;
  payload?: any;
  prevIndex?: number;
  tabId?: TabId;
  transactionId?: TransactionId;
  foundFirstMatch?: boolean;
}

export interface RemoveStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'remove-styles-all-tabs';
}

export interface ToggleStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'add-styles-all-tabs' | 'remove-styles-all-tabs';
}

export interface RemoveAllHighlightMatches extends BaseMessage {
  from: 'content';
  type: 'remove-all-highlight-matches';
}

export interface RemoveAllHighlightMatches_msg extends BaseMessage {
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
    store?: Store;
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
  from: 'background';
  type: 'highlight';
  findValue: string;
  foundFirstMatch: boolean;
  tabId: ValidTabId;
  tabState: {};
}

export interface ToggleStylesMsg extends BaseMessage {
  from: 'background:backgroundUtils';
  type: 'add-styles';
}

export interface RemoveAllHighlightMatchesMsg extends BaseMessage {
  from: 'background:backgroundUtils';
  type: 'remove-all-highlight-matches';
}

export interface ToggleSearchLayoverMsg extends BaseMessage {
  from: 'background';
  type: 'toggle_search_layover';
}

// type StateUpdateMessage = {
//   from: 'content';
//   type: 'state-update';
//   payload: {
//     state: LayoverState;
//   };
// };
export interface StateUpdateMessage extends BaseMessage {
  from: 'content';
  type: 'state-update';
  payload: any;
}

export interface CLOSE_SEARCH_OVERLAY_MESSAGE extends BaseMessage {
  from: 'content';
  type: 'CLOSE_SEARCH_OVERLAY';
  payload: any;
}

export type Messages =
  | GetAllMatchesMsg
  | NextMatchMsg
  | PrevMatchMsg
  | NextMatchMessage
  | PrevMatch_msg
  | NextMatch_msg
  | PreviousMatchMessage
  | RemoveStylesMessage
  | RemoveStylesAllTabs
  | RemoveAllHighlightMatches
  | ToggleStylesAllTabs
  | RemoveAllHighlightMatchesMsg
  | RemoveAllHighlightMatches_msg
  | SwitchTabMsg
  | UpdateHighlightsMsg
  | HighlightMsg
  | SwitchedActiveTabShowLayover
  | SwitchedActiveTabHideLayover
  | UpdateTabStatesObjMsg
  | UpdateStoreMsg
  | UpdateLayoverPositionMsg
  | ToggleStylesMsg
  | RemoveAllHighlightMatches_msg
  | ToggleSearchLayoverMsg
  | StateUpdateMessage
  | CLOSE_SEARCH_OVERLAY_MESSAGE;
