import { useEffect } from 'react';
import useTimeout from './useTimeout';

type VoidFunction = () => void;

export default function useDebounce(
  callback: VoidFunction,
  delay: number,
  dependencies: any[]
) {
  const { reset, clear } = useTimeout(callback, delay);

  useEffect(reset, [...dependencies, reset]);
  useEffect(clear, []);
}
