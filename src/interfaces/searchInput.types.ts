export interface SearchInputProps {
  onSubmit: (findValue: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  focus: boolean;

  // TODO: REVIEW THESE:
  onSearchValueChange: (searchValue: string) => void;
}
