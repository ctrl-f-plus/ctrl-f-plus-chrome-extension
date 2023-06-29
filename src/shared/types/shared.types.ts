// src/types/shared.types.ts

export enum Direction {
  NEXT = 'next',
  PREVIOUS = 'previous',
}

export type LayoverPosition = {
  x: number;
  y: number;
};

export interface BaseMessage {
  async?: boolean;
  payload?: unknown;
}

export type ResponseCallback = (response?: any) => void;
