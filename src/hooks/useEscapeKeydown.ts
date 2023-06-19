// src/hooks/useHandleKeyDown.ts

// FIXME: This hook is actually quite specific. Consider refactoring and generalizing

import { useEffect } from 'react';
import { sendMessageToBackground } from '../utils/messageUtils/sendMessageToBackground';

export default function useEscapeKeyDown(showLayover: boolean) {
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
