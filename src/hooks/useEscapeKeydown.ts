// src/hooks/useHandleKeyDown.ts

// FIXME: This hook is actually quite specific. Consider refactoring and generalizing

import { useContext, useEffect } from 'react';
import { sendMessageToBackground } from '../utils/sendMessageToBackground';
import { LayoverContext } from '../contexts/LayoverContext';

export default function useEscapeKeyDown() {
  const { showLayover } = useContext(LayoverContext);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLayover) {
        sendMessageToBackground({
          from: 'content',
          type: 'remove-styles-all-tabs',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLayover]);
}
