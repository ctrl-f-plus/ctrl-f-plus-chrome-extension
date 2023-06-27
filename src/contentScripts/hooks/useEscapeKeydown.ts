// src/hooks/useHandleKeyDown.ts

// FIXME: This hook is actually quite specific. Consider refactoring and generalizing

import { useContext, useEffect } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import { REMOVE_ALL_STYLES, RemoveAllStylesMsg } from '../types/message.types';
import { sendMessageToBackground } from '../utils/messaging/sendMessageToBackground';

export default function useEscapeKeyDown() {
  const { showLayover } = useContext(LayoverContext);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLayover) {
        sendMessageToBackground<RemoveAllStylesMsg>({
          type: REMOVE_ALL_STYLES,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLayover]);
}
