// src/utils/calculateTargetIndex.ts

import { Direction } from '../../../shared/types/shared.types';

export default function calculateTargetIndex(
  direction: Direction,
  currentIndex: number,
  totalCount: number
): number {
  if (direction === Direction.NEXT) {
    return (currentIndex + 1) % totalCount;
  }

  return (currentIndex - 1 + totalCount) % totalCount;
}
