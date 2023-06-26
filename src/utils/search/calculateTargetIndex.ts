// src/utils/calculateTargetIndex.ts

import { Direction } from '../../types/shared.types';

export default function calculateTargetIndex(
  direction: Direction,
  currentIndex: number,
  totalCount: number
): number {
  if (direction === 'next') {
    return (currentIndex + 1) % totalCount;
  }

  return (currentIndex - 1 + totalCount) % totalCount;
}
