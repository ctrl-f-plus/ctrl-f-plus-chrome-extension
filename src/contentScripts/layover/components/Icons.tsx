// src/contentScripts/layover/components/Icons.tsx

type IconProps = {
  className: string;
};

export function ChevronUpIcon({ className }: IconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   fill="none"
    //   viewBox="0 0 24 24"
    //   stroke-width="1.5"
    //   stroke="currentColor"
    //   class="w-6 h-6"
    // >
    //   <path
    //     stroke-linecap="round"
    //     stroke-linejoin="round"
    //     d="M4.5 15.75l7.5-7.5 7.5 7.5"
    //   />
    // </svg>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.55806 6.43306C9.80214 6.18898 10.1979 6.18898 10.4419 6.43306L16.6919 12.6831C16.936 12.9271 16.936 13.3229 16.6919 13.5669C16.4479 13.811 16.0521 13.811 15.8081 13.5669L10 7.75888L4.19194 13.5669C3.94786 13.811 3.55214 13.811 3.30806 13.5669C3.06398 13.3229 3.06398 12.9271 3.30806 12.6831L9.55806 6.43306Z"
        fill="white"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   fill="none"
    //   viewBox="0 0 24 24"
    //   strokeWidth={1.5}
    //   stroke="currentColor"
    //   className="w-6 h-6"
    // >
    //   <path
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //     d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    //   />
    // </svg>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.4419 13.5669C10.1979 13.811 9.80214 13.811 9.55806 13.5669L3.30806 7.31694C3.06398 7.07286 3.06398 6.67714 3.30806 6.43306C3.55214 6.18898 3.94786 6.18898 4.19194 6.43306L10 12.2411L15.8081 6.43306C16.0521 6.18898 16.4479 6.18898 16.6919 6.43306C16.936 6.67714 16.936 7.07286 16.6919 7.31694L10.4419 13.5669Z"
        fill="white"
      />
    </svg>
  );
}

export function XMarkIcon({ className }: IconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   fill="none"
    //   viewBox="0 0 24 24"
    //   strokeWidth={1.5}
    //   stroke="currentColor"
    //   className="w-6 h-6"
    // >
    //   <path
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //     d="M6 18L18 6M6 6l12 12"
    //   />
    // </svg>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.16272 5.16272C5.37968 4.94576 5.73143 4.94576 5.94839 5.16272L10 9.21433L14.0516 5.16272C14.2686 4.94576 14.6203 4.94576 14.8373 5.16272C15.0542 5.37968 15.0542 5.73144 14.8373 5.94839L10.7857 10L14.8373 14.0516C15.0542 14.2686 15.0542 14.6203 14.8373 14.8373C14.6203 15.0542 14.2686 15.0542 14.0516 14.8373L10 10.7857L5.94839 14.8373C5.73143 15.0542 5.37968 15.0542 5.16272 14.8373C4.94576 14.6203 4.94576 14.2686 5.16272 14.0516L9.21433 10L5.16272 5.94839C4.94576 5.73143 4.94576 5.37968 5.16272 5.16272Z"
        fill="white"
      />
    </svg>
  );
}
