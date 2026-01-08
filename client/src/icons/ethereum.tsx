import React from "react";

export const IconEthereum = ({ className, size, ...props }: { className?: string; size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 12l6 -9l6 9l-6 9l-6 -9" />
      <path d="M6 12l6 -3l6 3l-6 2l-6 -2" />
    </svg>
  );
};
