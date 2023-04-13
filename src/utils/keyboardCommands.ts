// src/utils/keyboardCommands.ts

// TODO: Refactor this whole thing?

export type KeyboardCommandHandler = {
  toggleSearchOverlay?: () => void;
  closeSearchOverlay?: () => void;
};

export interface HandleKeyboardCommandParams {
  command: string;
  handlers: KeyboardCommandHandler;
}

export const handleKeyboardCommand = (
  command: string,
  handlers: KeyboardCommandHandler
) => {
  if (command === 'toggle_search_overlay' && handlers.toggleSearchOverlay) {
    handlers.toggleSearchOverlay();
  } else if (
    command === 'close_search_overlay' &&
    handlers.closeSearchOverlay
  ) {
    handlers.closeSearchOverlay();
  }
};
