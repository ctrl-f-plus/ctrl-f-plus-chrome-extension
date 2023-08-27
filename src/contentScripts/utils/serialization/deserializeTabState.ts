// src/utils/deserializeTabState.ts

import { SerializedTabState, XPathTabState } from '../../types/tab.types';

export default function deserializeTabState(
  shallowStateObject: SerializedTabState
): XPathTabState {
  const { serializedMatches, ...otherProperties } = shallowStateObject;

  const serializedXPaths = serializedMatches;

  const deserializedXPaths =
    serializedXPaths === '' ? [] : JSON.parse(serializedXPaths);

  const deserializedState: XPathTabState = {
    ...otherProperties,
    queryMatches: deserializedXPaths,
  };

  return deserializedState;
}
