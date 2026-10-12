import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

const icons = {
  dashboard: (p: P) => (
    <svg {...base(p)}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
  ),
  projects: (p: P) => (
    <svg {...base(p)}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
  ),
  board: (p: P) => (
    <svg {...base(p)}><rect x="3" y="4" width="4.5" height="16" rx="1.2" /><rect x="9.75" y="4" width="4.5" height="11" rx="1.2" /><rect x="16.5" y="4" width="4.5" height="14" rx="1.2" /></svg>
  ),
  team: (p: P) => (
    <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5" /><path d="M17 20a6 6 0 0 0-2-4.5" /></svg>
  ),
  bell: (p: P) => (
    <svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
  ),
  settings: (p: P) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.7 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 6.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1H10a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8Z" /></svg>
  ),
  search: (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>),
  plus: (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>),
  check: (p: P) => (<svg {...base(p)}><path d="m20 6-11 11-5-5" /></svg>),
  x: (p: P) => (<svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>),
  chevronDown: (p: P) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>),
  chevronRight: (p: P) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>),
  chevronLeft: (p: P) => (<svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>),
  calendar: (p: P) => (<svg {...base(p)}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>),
  clock: (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>),
  check_circle: (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 5-5" /></svg>),
  alert: (p: P) => (<svg {...base(p)}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17.5v.5" /></svg>),
  trend: (p: P) => (<svg {...base(p)}><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>),
  trendDown: (p: P) => (<svg {...base(p)}><path d="m3 7 6 6 4-4 8 8" /><path d="M17 17h4v-4" /></svg>),
  download: (p: P) => (<svg {...base(p)}><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 21h16" /></svg>),
  upload: (p: P) => (<svg {...base(p)}><path d="M12 15V3m0 0 4 4m-4-4L8 7" /><path d="M4 21h16" /></svg>),
  file: (p: P) => (<svg {...base(p)}><path d="M14 3v5h5" /><path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /></svg>),
  edit: (p: P) => (<svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>),
  trash: (p: P) => (<svg {...base(p)}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0-.7 12a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L6 7" /></svg>),
  dots: (p: P) => (<svg {...base(p)}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>),
  logout: (p: P) => (<svg {...base(p)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></svg>),
  sun: (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>),
  moon: (p: P) => (<svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>),
  eye: (p: P) => (<svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>),
  eyeOff: (p: P) => (<svg {...base(p)}><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" /><path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3-.5" /></svg>),
  mail: (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>),
  lock: (p: P) => (<svg {...base(p)}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>),
  user: (p: P) => (<svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>),
  filter: (p: P) => (<svg {...base(p)}><path d="M3 5h18l-7 8v6l-4-2v-4Z" /></svg>),
  sort: (p: P) => (<svg {...base(p)}><path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3" /></svg>),
  logo: (p: P) => (
    <svg width={26} height={26} viewBox="0 0 32 32" fill="none" {...p}>
      <rect width="32" height="32" rx="8" fill="var(--primary)" />
      <rect x="7" y="7" width="7" height="18" rx="2" fill="#fff" opacity="0.95" />
      <rect x="18" y="7" width="7" height="11" rx="2" fill="#fff" opacity="0.7" />
    </svg>
  ),
  globe: (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>),
  shield: (p: P) => (<svg {...base(p)}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z" /><path d="m9 12 2 2 4-4" /></svg>),
  device: (p: P) => (<svg {...base(p)}><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>),
  message: (p: P) => (<svg {...base(p)}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" /></svg>),
  flag: (p: P) => (<svg {...base(p)}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>),
  tag: (p: P) => (<svg {...base(p)}><path d="M3 12V4a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z" /><circle cx="8" cy="8" r="1.2" /></svg>),
};

export type IconName = keyof typeof icons;

function IconComponent({ name, ...rest }: { name: IconName } & P) {
  const Glyph = icons[name];
  return <Glyph {...rest} />;
}

/**
 * Supports both `<Icon name="dashboard" />` and the legacy dot-access
 * `<Icon.dashboard />` used across existing screens.
 */
export const Icon = Object.assign(IconComponent, icons);
