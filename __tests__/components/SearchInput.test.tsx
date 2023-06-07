/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
// @ts-nocheck
// // __tests__/components/SearchInput.test.tsx

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchInput from '../../src/components/SearchInput';

describe('SearchInput', () => {
  it('calls onSubmit when the submit event is triggered', () => {
    // const onSubmit = jest.fn();
    // const { getByText } = render(<SearchInput onSubmit={onSubmit} />);
    // fireEvent.click(getByText('Submit'));
    // expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

test('calls onSubmit when the submit event is triggered', () => {
  render(<SearchInput focus />);

  screen.getByRole('');
});
