// src/interfaces/message.types.ts

import { LayoverPosition } from './Layover.types';
import { TabStore } from './Store.types';
import { SerializedTabState, ValidTabId } from './tab.types';

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
  // payload?: unknown; // TODO: you might need to add this back, but i think you are fine without it
  payload?: any;
  transactionId?: TransactionId;
}

export interface GetAllMatchesMsg extends BaseMessage {
  from: 'content';
  type: 'get-all-matches';
  payload: { searchValue: string };
}

export interface RemoveAllHighlightMatches extends BaseMessage {
  from: 'content';
  type: 'remove-all-highlight-matches';
  // payload: any;
}

export interface RemoveAllHighlightMatchesMsg extends BaseMessage {
  async: false;
  from: 'background:backgroundUtils';
  type: 'remove-all-highlight-matches';
  // payload: any;
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
  // payload: any;
  // TODO: direction probably shouild be a boolean or it should use CONSTANTS
  payload: {
    serializedState: SerializedTabState;
    direction: 'next' | 'previous';
    // direction: 'forward' | 'backward';
  };
}

export interface UpdateHighlightsMsg extends BaseMessage {
  async: true;
  from: 'background';
  type: 'update-highlights';
  payload: {
    tabId: ValidTabId;
    direction: 'next' | 'previous';
  };
}

export interface UpdateTabStatesObjMsg extends BaseMessage {
  from: 'content:match-utils';
  type: 'update-tab-states-obj';
  // payload: any;
  payload: { serializedState: SerializedTabState };
}

export interface UpdateStoreMsg extends BaseMessage {
  from: 'background:store';
  type: 'store-updated';
  // payload: any;
  // payload: {
  //   tabId: ValidTabId;
  //   store?: Store;
  //   tabStore?: TabStore;
  // };

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
  // payload: any;
  // TODO: change findValue to searchValue?
  payload: {
    findValue: string;
    // searchValue: string;
    tabId: ValidTabId;
    foundFirstMatch: boolean;
  };
}

// export interface CLOSE_SEARCH_OVERLAY_MESSAGE extends BaseMessage {
//   from: 'content';
//   type: 'CLOSE_SEARCH_OVERLAY';
//   payload: any;
// }

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
// | CLOSE_SEARCH_OVERLAY_MESSAGE;
