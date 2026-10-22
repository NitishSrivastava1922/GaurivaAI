const Icon = ({ children, size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const MessageSquare = (props) => (
  <Icon {...props}>
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </Icon>
);
export const PanelLeftIcon = (props) => (
  <Icon {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18M14 9l-3 3 3 3" />
  </Icon>
);
export const PanelRightIcon = (props) => (
  <Icon {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18M10 9l3 3-3 3" />
  </Icon>
);
export const PanelRight = PanelRightIcon;
export const PenSquare = (props) => (
  <Icon {...props}>
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M16 3l5 5M12 17l-4 1 1-4L18 5a2 2 0 0 1 3 3z" />
  </Icon>
);
export const Plus = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const User = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const Coins = (props) => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="5" />
    <path d="M8 3v10M5.5 6.5h5M5.5 9.5h5" />
    <circle cx="16" cy="16" r="5" />
  </Icon>
);
export const LogOut = (props) => (
  <Icon {...props}>
    <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" />
  </Icon>
);
export const Paperclip = (props) => (
  <Icon {...props}>
    <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.48-8.48" />
  </Icon>
);
export const Send = (props) => (
  <Icon {...props}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4Z" />
  </Icon>
);

export const Mic = (props) => (
  <Icon {...props}>
    <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
    <path d="M19 10a7 7 0 0 1-14 0" />
    <path d="M12 19v3" />
    <path d="M8 22h8" />
  </Icon>
);

export const GoogleLogo = ({ size = 20, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    <path
      fill="#4285F4"
      d="M21.35 12.23c0-.71-.06-1.23-.2-1.77H12v3.36h5.37c-.11.83-.73 2.08-2.1 2.92l-.02.11 3.05 2.31.21.02c1.93-1.74 2.84-4.3 2.84-6.95Z"
    />
    <path
      fill="#34A853"
      d="M12 21.5c2.63 0 4.83-.85 6.44-2.32l-3.07-2.44c-.82.56-1.92.95-3.37.95a5.84 5.84 0 0 1-5.54-3.96l-.11.01-3.17 2.4-.04.1A9.72 9.72 0 0 0 12 21.5Z"
    />
    <path
      fill="#FBBC05"
      d="M6.46 13.73A5.8 5.8 0 0 1 6.15 12c0-.6.11-1.17.3-1.73v-.12L3.25 7.7l-.1.05A9.38 9.38 0 0 0 2.15 12c0 1.52.37 2.96 1 4.24l3.31-2.51Z"
    />
    <path
      fill="#EA4335"
      d="M12 6.31c1.83 0 3.07.77 3.78 1.42l2.76-2.64C16.82 3.54 14.63 2.5 12 2.5a9.72 9.72 0 0 0-8.85 5.25l3.3 2.52A5.86 5.86 0 0 1 12 6.31Z"
    />
  </svg>
);
