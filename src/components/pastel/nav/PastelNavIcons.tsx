import type { PastelNavId } from "./pastelNav";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export function PastelNavIcon({ id }: { id: PastelNavId | "more" }) {
  switch (id) {
    case "home":
      return (
        <svg {...iconProps}>
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "scores":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
        </svg>
      );
    case "tables":
      return (
        <svg {...iconProps}>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    case "favourites":
      return (
        <svg {...iconProps}>
          <path d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.8 6.7 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
        </svg>
      );
    case "transfers":
      return (
        <svg {...iconProps}>
          <path d="M7 7h11M14 3l4 4-4 4M17 17H6M10 13l-4 4 4 4" />
        </svg>
      );
    case "news":
      return (
        <svg {...iconProps}>
          <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </svg>
      );
    case "videos":
      return (
        <svg {...iconProps}>
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 10 5-3v10l-5-3v-4Z" />
        </svg>
      );
    case "articles":
      return (
        <svg {...iconProps}>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "more":
      return (
        <svg {...iconProps}>
          <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}
