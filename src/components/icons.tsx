import type { SVGProps } from "react";

export function ApplyGeniusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12c.552 0 1-.448 1-1V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6c0 .552.448 1 1 1" />
      <path d="M3 13a9 9 0 1 0 9-9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

// Keep the old name for backward compatibility
export const CoverProIcon = ApplyGeniusIcon;
