export interface BaseMessage {
  from: 'background' | 'content';
  type: string;
  payload?: any;
}

export interface ExampleMessage extends BaseMessage {
  type: 'example-message';
  payload: string;
}

export interface GetInnerHtmlMessage extends BaseMessage {
  type: 'get-inner-html';
  payload: {
    tabId: number;
    title: string;
    matches: any[];
  };
}

export interface ExecuteContentScript extends BaseMessage {
  type: 'execute-content-script';
  payload: string;
}

export interface HighlightMatchesMessage extends BaseMessage {
  type: 'highlight-matches';
  findValue: string;
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

export interface GetAllMatchesMessage extends BaseMessage {
  type: 'get-all-matches';
  findValue: string;
}

export interface AllMatchesMessage extends BaseMessage {
  type: 'all-matches';
  allMatches: any[];
}

export interface GetAllMatchesRequest {
  type: 'get-allMatches';
}

export type Messages = {
  from?: 'content' | 'popup' | 'background';
} & (
  | ExampleMessage
  | GetInnerHtmlMessage
  | ExecuteContentScript
  | HighlightMatchesMessage
  | NextMatchMessage
  | PreviousMatchMessage
  | GetAllMatchesMessage
  | AllMatchesMessage
  | GetAllMatchesRequest
);
