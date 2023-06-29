// src/contentScripts/__tests__/useMessageHandler.test.tsx

import { render } from '@testing-library/react';
import { useCallback } from 'react';
import useMessageHandler from '../hooks/useMessageHandler';

global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
};

describe('useMessageHandler', () => {
  let mockHandleMessage: jest.Mock;

  beforeEach(() => {
    mockHandleMessage = jest.fn();
    jest.clearAllMocks();
  });

  function TestComponent() {
    const memoizedHandler = useCallback(mockHandleMessage, []);
    useMessageHandler(memoizedHandler);

    return null;
  }

  it('adds the message listener when mounted', () => {
    render(<TestComponent />);

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(
      mockHandleMessage
    );
  });

  it('removes the message listener when unmounted', () => {
    const { unmount } = render(<TestComponent />);

    unmount();

    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(
      mockHandleMessage
    );
  });

  it('does not add or remove the listener when the handler does not change', () => {
    const { rerender } = render(<TestComponent />);

    rerender(<TestComponent />);

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.onMessage.removeListener).not.toHaveBeenCalled();
  });
});
