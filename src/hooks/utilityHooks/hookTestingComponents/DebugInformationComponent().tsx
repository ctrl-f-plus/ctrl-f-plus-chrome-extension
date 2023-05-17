import { useState } from 'react';
import useToggle from '../useToggle';
import React from 'react';
import useDebugInformation from '../useDebugInformation';

interface ChildProps {
  boolean: boolean;
  count: number;
}

export default function DebugInformationComponent() {
  const [boolean, toggle] = useToggle(false);
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>DebugInformationComponent()</h1>

      <ChildComponent boolean={boolean} count={count} />
      <button onClick={() => toggle()}>Toggle</button>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>
        Increment
      </button>
    </>
  );
}

function ChildComponent(props: ChildProps) {
  const info = useDebugInformation('ChildComponent', props);

  return (
    <>
      <div>{props.boolean.toString()}</div>
      <div>{props.count}</div>
      <div>{JSON.stringify(info, null, 2)}</div>
    </>
  );
}
