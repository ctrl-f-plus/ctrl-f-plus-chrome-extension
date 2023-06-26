// src/utils/calculateTargetIndex.ts

export default function calculateTargetIndex(
  direction: 'next' | 'previous',
  currentIndex: number,
  totalCount: number
): number {
  if (direction === 'next') {
    return (currentIndex + 1) % totalCount;
  }

  return (currentIndex - 1 + totalCount) % totalCount;
}
