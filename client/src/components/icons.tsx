interface IconProps {
  s?: number
}

const svgProps = (s: number) => ({
  width: s,
  height: s,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const Icon = {
  Needle: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M4 20 L14 10 M14 10 L19 5 M17 3 L21 7 M14 10 L16 12" /></svg>
  ),
  Leaf: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M5 19 C5 9, 12 4, 20 4 C20 13, 14 19, 5 19 Z M5 19 C8 14, 12 10, 16 8" /></svg>
  ),
  Leaf2: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M12 21 C7 16, 6 9, 12 3 C18 9, 17 16, 12 21 Z M12 7 L12 21" /></svg>
  ),
  Cup: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M6 4 L18 4 C18 12, 16 18, 12 18 C8 18, 6 12, 6 4 Z M8 21 L16 21" /></svg>
  ),
  Calendar: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><rect x="4" y="5" width="16" height="16" rx="1.5" /><path d="M4 10 L20 10 M8 3 L8 7 M16 3 L16 7" /></svg>
  ),
  ArrowLeft: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M19 12 L5 12 M11 6 L5 12 L11 18" /></svg>
  ),
  Close: ({ s = 18 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M6 6 L18 18 M18 6 L6 18" /></svg>
  ),
  Check: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M4 12.5 L9.5 18 L20 6.5" /></svg>
  ),
  Phone: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M5 4 L9 4 L10.5 9 L8.5 10.5 C9.5 13, 11 14.5, 13.5 15.5 L15 13.5 L20 15 L20 19 C20 20, 19 21, 18 20.5 C11 18.5, 5.5 13, 3.5 6 C3.2 5, 4 4, 5 4 Z" /></svg>
  ),
  Mail: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3.5 7 L12 13 L20.5 7" /></svg>
  ),
  Clock: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5 L12 12 L15.5 14" /></svg>
  ),
  Pin: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M12 21 C12 21, 5.5 14.5, 5.5 9.5 C5.5 6, 8.5 3.5, 12 3.5 C15.5 3.5, 18.5 6, 18.5 9.5 C18.5 14.5, 12 21, 12 21 Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
  ),
  Menu: ({ s = 22 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M4 7 L20 7 M4 12 L20 12 M4 17 L20 17" /></svg>
  ),
  Users: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><circle cx="9" cy="8.5" r="3.5" /><path d="M3.5 19.5 C3.5 16, 6 14, 9 14 C12 14, 14.5 16, 14.5 19.5 M15.5 5.5 C17 6, 18 7.5, 18 9 C18 10.5, 17 12, 15.5 12.5 M16.5 14.5 C19 15, 20.5 17, 20.5 19.5" /></svg>
  ),
  Dot: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></svg>
  ),
  Inbox: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M4 13 L8 13 C8.5 15, 10 16, 12 16 C14 16, 15.5 15, 16 13 L20 13 M4 13 L6 5.5 L18 5.5 L20 13 M4 13 L4 18.5 L20 18.5 L20 13" /></svg>
  ),
  Chart: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M4 20 L20 20 M7 20 L7 13 M12 20 L12 7 M17 20 L17 10" /></svg>
  ),
  Settings: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><circle cx="12" cy="12" r="3" /><path d="M12 4 L12 6.5 M12 17.5 L12 20 M20 12 L17.5 12 M6.5 12 L4 12 M17.7 6.3 L15.9 8.1 M8.1 15.9 L6.3 17.7 M17.7 17.7 L15.9 15.9 M8.1 8.1 L6.3 6.3" /></svg>
  ),
  Search: ({ s = 20 }: IconProps) => (
    <svg {...svgProps(s)}><circle cx="11" cy="11" r="6.5" /><path d="M16 16 L20.5 20.5" /></svg>
  ),
  ChevronPrev: ({ s = 12 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M9 6 L15 12 L9 18" /></svg>
  ),
  ChevronNext: ({ s = 12 }: IconProps) => (
    <svg {...svgProps(s)}><path d="M15 6 L9 12 L15 18" /></svg>
  ),
  Instagram: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
  ),
  // classic Facebook "f" letterform — instantly recognizable
  Facebook: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}>
      <path d="M13.5 21 L13.5 13.5 L16.2 13.5 L16.7 10.2 L13.5 10.2 L13.5 8.1 C13.5 7.1 14 6.4 15.2 6.4 L16.8 6.4 L16.8 3.4 C16.2 3.3 15.2 3.2 14.3 3.2 C11.7 3.2 10 4.8 10 7.7 L10 10.2 L7.2 10.2 L7.2 13.5 L10 13.5 L10 21 Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  // speech bubble with tail + handset, matching the official WhatsApp glyph
  Whatsapp: ({ s = 16 }: IconProps) => (
    <svg {...svgProps(s)}>
      <path d="M4 20 L5.4 16.3 C4.5 15, 4 13.5, 4 12 A 8 8 0 1 1 12 20 C 10.5 20, 9 19.6, 7.7 18.7 Z" />
      <path d="M9.3 8.2 C9.55 8.2 9.7 8.25 9.9 8.7 L10.5 10.1 C10.6 10.4 10.55 10.6 10.35 10.8 L9.8 11.45 C10.4 12.6 11.4 13.6 12.55 14.2 L13.2 13.65 C13.4 13.45 13.6 13.4 13.9 13.5 L15.3 14.1 C15.75 14.3 15.8 14.45 15.8 14.7 C15.8 15.6 15 16.4 14.1 16.35 C10.7 16.2 7.8 13.3 7.65 9.9 C7.6 9 8.4 8.2 9.3 8.2 Z" fill="currentColor" stroke="none" />
    </svg>
  ),
}
