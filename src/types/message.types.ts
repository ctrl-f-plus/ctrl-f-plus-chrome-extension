// src/interfaces/message.types.ts

import { Store, TabStore } from '../background/store';
import { LayoverPosition } from '../components/Layover';
import { SerializedTabState, TabId, ValidTabId } from './tab.types';

export type TransactionId = Exclude<string, undefined>;

// export const MESSAGES = {
//   REMOVE_ALL_HIGHLIGHT_MATCHES: 'REMOVE_ALL_HIGHLIGHT_MATCHES',
//   GET_ALL_MATCHES: 'GET_ALL_MATCHES',
//   UPDATE_TAB_STATES_OBJ: 'UPDATE_TAB_STATES_OBJ',
//   SWITCH_TAB: 'SWITCH_TAB',
//   REMOVE_STYLES_ALL_TABS: 'REMOVE_STYLES_ALL_TABS',
//   UPDATE_LAYOVER_POSITION: 'UPDATE_LAYOVER_POSITION',
// };

// export type MessageTypes = keyof typeof MESSAGES;

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
  // type: string | MessageTypes;
  payload?: any;
  serializedState2?: any;
  serializedState?: any;
  transactionId?: TransactionId;
}

export interface GetAllMatchesMsg extends BaseMessage {
  from: 'content';
  type: 'get-all-matches';
  payload: any;
}

export interface MessageFixMe {
  async: boolean | true;
  type: string;
  command?: string;
  payload?: any;
  prevIndex?: number;
  tabId?: TabId;
  transactionId?: TransactionId;
  foundFirstMatch?: boolean;
}

export interface RemoveAllHighlightMatches extends BaseMessage {
  from: 'content';
  type: 'remove-all-highlight-matches';
  // type: typeof MESSAGES.REMOVE_ALL_HIGHLIGHT_MATCHES;
}

export interface RemoveAllHighlightMatchesMsg extends BaseMessage {
  from: 'background:backgroundUtils';
  type: 'remove-all-highlight-matches';
  // type: typeof MESSAGES.REMOVE_ALL_HIGHLIGHT_MATCHES;
}

export interface RemoveStylesAllTabs extends BaseMessage {
  from: 'content';
  type: 'remove-styles-all-tabs';
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
  // prevIndex: number | undefined;
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
  payload: any;
  // payload: {
  //   findValue: string;
  //   foundFirstMatch: boolean;
  //   tabId: ValidTabId;
  //   tabState: {};
  // };
}

export interface CLOSE_SEARCH_OVERLAY_MESSAGE extends BaseMessage {
  from: 'content';
  type: 'CLOSE_SEARCH_OVERLAY';
  payload: any;
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
  | UpdateLayoverPositionMsg
  | CLOSE_SEARCH_OVERLAY_MESSAGE;
