import { useEffect, useRef, useCallback } from 'react';

type VoidFunction = () => void;

export default function useTimeout(callback: VoidFunction, delay: number) {
  const callbackRef = useRef<VoidFunction>(callback);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
  }, [delay]);

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return { reset, clear };
}
