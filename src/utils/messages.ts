// src/utils/messages.ts
export interface BaseMessage {
  from: 'background' | 'content';
  type: string;
  payload?: any;
}

export interface GetInnerHtmlMessage extends BaseMessage {
  type: 'get-inner-html';
  payload: {
    tabId: number;
    title: string;
    matches: any[];
  };
}

export interface GetAllMatchesMessage extends BaseMessage {
  from: 'content';
  type: 'get-all-matches-msg';
  payload: string;
}

export interface NextMatchMessage extends BaseMessage {
  from: 'content';
  type: 'next-match';
  findValue: string;
}

export interface PreviousMatchMessage extends BaseMessage {
  from: 'content';
  type: 'prev-match';
  findValue: string;
}

// export interface AllMatchesMessage extends BaseMessage {
//   type: 'all-matches';
//   allMatches: any[];
// }

export interface GetAllMatchesRequest {
  type: 'get-all-matches-req';
}

export interface RemoveStylesMessage extends BaseMessage {
  from: 'background' | 'content';
  type: 'remove_styles';
}

export type Messages = {
  from?: 'content' | 'popup' | 'background';
} & (
  | GetInnerHtmlMessage
  | NextMatchMessage
  | PreviousMatchMessage
  | GetAllMatchesMessage
  // | AllMatchesMessage
  | GetAllMatchesRequest
  | RemoveStylesMessage
);
