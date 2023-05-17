import { useState } from 'react';

export default function useToggle(defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(defaultValue);

  function toggleValue(value?: boolean): void {
    setValue((currentValue: boolean) =>
      typeof value === 'boolean' ? value : !currentValue
    );
  }

  return [value, toggleValue] as const;
}

/*
 *To Use:
 *  const [value, toggleValue] = useToggle(false);
 */
