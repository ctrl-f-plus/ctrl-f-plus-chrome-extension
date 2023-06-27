// src/hooks/useHandleKeyDown.ts

// FIXME: This hook is actually quite specific. Consider refactoring and generalizing

import { useContext, useEffect } from 'react';
import { sendMessageToBackground } from '../utils/messaging/sendMessageToBackground';
import { LayoverContext } from '../contexts/LayoverContext';
import { REMOVE_ALL_STYLES } from '../types/message.types';

export default function useEscapeKeyDown() {
  const { showLayover } = useContext(LayoverContext);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLayover) {
        sendMessageToBackground({ type: REMOVE_ALL_STYLES });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLayover]);
}
