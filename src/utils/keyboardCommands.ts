// src/utils/keyboardCommands.ts

// TODO: Refactor this whole thing?

export type KeyboardCommandHandler = {
  toggleSearchLayover?: () => void;
  closeSearchLayover?: () => void;
};

export interface HandleKeyboardCommandParams {
  command: string;
  handlers: KeyboardCommandHandler;
}

export const handleKeyboardCommand = (
  command: string,
  handlers: KeyboardCommandHandler
) => {
  if (command === 'toggle_search_layover' && handlers.toggleSearchLayover) {
    handlers.toggleSearchLayover();
  } else if (
    command === 'close_search_layover' &&
    handlers.closeSearchLayover
  ) {
    handlers.closeSearchLayover();
  }
};
