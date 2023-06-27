// __tests__ / hooks / useSearchHandler.test.ts

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { sendMessageToBackground } from '../../src/utils/messaging/sendMessageToBackground';
import { clearAllStoredTabs } from '../../src/utils/background/storage';
import useSearchHandler from '../../src/contentScripts/hooks/useSearchHandler';
import {
  GET_ALL_MATCHES,
  REMOVE_ALL_HIGHLIGHT_MATCHES,
} from '../../src/contentScripts/types/message.types';

jest.mock('../../src/utils/messageUtils/sendMessageToBackground');
jest.mock('../../src/background/storage.ts');

describe('useSearchHandler', () => {
  it('updates search and last search values', async () => {
    const setSearchValue = jest.fn();
    const setLastSearchValue = jest.fn();
    const contextValues = { setSearchValue, setLastSearchValue };

    // Mock the context
    jest.spyOn(React, 'useContext').mockImplementation(() => contextValues);

    const { result } = renderHook(useSearchHandler);

    const newSearchValue = 'New search value';

    await act(async () => {
      await result.current.handleSearch(newSearchValue);
    });

    expect(setSearchValue).toHaveBeenCalledWith(newSearchValue);
    expect(setLastSearchValue).toHaveBeenCalledWith(newSearchValue);

    // Verifying that the utility functions were called
    expect(clearAllStoredTabs).toHaveBeenCalled();
    expect(sendMessageToBackground).toHaveBeenCalledTimes(2);
    expect(sendMessageToBackground).toHaveBeenNthCalledWith(1, {
      type: REMOVE_ALL_HIGHLIGHT_MATCHES,
    });
    expect(sendMessageToBackground).toHaveBeenNthCalledWith(2, {
      type: GET_ALL_MATCHES,
      payload: {
        searchValue: newSearchValue,
      },
    });
  });
});
