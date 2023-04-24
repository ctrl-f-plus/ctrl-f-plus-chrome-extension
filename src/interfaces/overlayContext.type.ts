import { ReactNode } from 'react';

export interface OverlayContextData {
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSearchOverlay: () => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export interface OverlayProviderProps {
  children: ReactNode;
}
