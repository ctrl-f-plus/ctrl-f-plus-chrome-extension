import React, { useState } from 'react';
import useDebounce from '../useDebounce';

export default function DebounceComponent() {
  const [count, setCount] = useState<number>(10);
  useDebounce(() => alert(count), 1000, [count]);

  return (
    <>
      <h1>Debounce Component</h1>
      <div>{count}</div>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </>
  );
}
