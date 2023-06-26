// src/types/shared.types.ts

// import { DIRECTION_NEXT, DIRECTION_PREVIOUS } from '../utils/constants';

// export type Direction = typeof DIRECTION_NEXT | typeof DIRECTION_PREVIOUS;
export enum Direction {
  NEXT = 'next',
  PREVIOUS = 'previous',
}

export type LayoverPosition = {
  x: number;
  y: number;
};
