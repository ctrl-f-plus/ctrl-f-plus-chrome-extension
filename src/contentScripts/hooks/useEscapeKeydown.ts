// src/contentScripts/hooks/useEscapeKeydown.ts

import { useContext, useEffect } from 'react';
import { LayoverContext } from '../contexts/LayoverContext';
import {
  REMOVE_ALL_STYLES,
  RemoveAllStylesMsg,
} from '../types/toBackgroundMessage.types';
import sendMessageToBackground from '../utils/messaging/sendMessageToBackground';

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
