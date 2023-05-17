import React from 'react';
import useToggle from '../useToggle';

export default function ToggleComponent() {
  const [value, toggleValue] = useToggle(false);

  return (
    <div>
      <div>{value.toString()}</div>
      <button onClick={() => toggleValue()}>Toggle</button>
      <button onClick={() => toggleValue(true)}>Set to True</button>
      <button onClick={() => toggleValue(false)}>Set to False</button>
    </div>
  );
}
