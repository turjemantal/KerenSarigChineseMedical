// Shared primitives + icons for Jade Root Clinic
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ---------- Enso brand mark ----------
const Enso = ({ size = 40, color = "#1C2A24" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M 50 10 A 40 40 0 1 1 20 78"
      stroke={color}
      strokeWidth="5.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="50" cy="50" r="2.5" fill="#C4634A" />
  </svg>
);

// ---------- Red chop / seal ----------
const Chop = ({ char = "醫", size = 64, rotate = -4 }) => (
  <div
    style={{
      width: size,
      height: size,
      transform: `rotate(${rotate}deg)`,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#C4634A",
      color: "#F5F1EA",
      fontFamily: "'Noto Serif SC', serif",
      fontSize: size * 0.55,
      fontWeight: 700,
      boxShadow: "inset 0 0 0 2px #F5F1EA, inset 0 0 0 4px #C4634A",
      letterSpacing: "-0.05em",
      lineHeight: 1,
      paddingBottom: 2,
    }}
  >
    {char}
  </div>
);

// ---------- Ink rule ----------
const InkRule = ({ className = "", color = "#1C2A24", opacity = 0.15 }) => (
  <div
    className={className}
    style={{ height: 1, background: color, opacity, width: "100%" }}
  />
);

// ---------- Icons (hand-tuned, minimal stroke) ----------
const Icon = {
  Needle: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 21 L14 10" />
      <path d="M14 10 L18 6 L20 8 L16 12 Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M6 18 L5 19" />
      <path d="M9 15 L8 16" />
    </svg>
  ),
  Leaf: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19 C 5 10, 12 4, 20 4 C 20 13, 14 19, 5 19 Z" fill="currentColor" fillOpacity="0.08" />
      <path d="M5 19 C 10 14, 15 10, 20 4" />
    </svg>
  ),
  Leaf2: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21 C 12 12, 6 8, 4 4 C 10 5, 13 9, 13 14" fill="currentColor" fillOpacity="0.08" />
      <path d="M12 21 C 12 15, 16 10, 20 8 C 19 14, 16 19, 12 21 Z" fill="currentColor" fillOpacity="0.08" />
    </svg>
  ),
  Cup: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <ellipse cx="12" cy="6" rx="6" ry="2" />
      <path d="M6 6 C 6 14, 8 17, 12 17 C 16 17, 18 14, 18 6" fill="currentColor" fillOpacity="0.08" />
      <path d="M10 20 L14 20" />
    </svg>
  ),
  Calendar: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10 L21 10" />
      <path d="M8 3 L8 7" />
      <path d="M16 3 L16 7" />
    </svg>
  ),
  Users: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20 C 3 15, 6 13, 9 13 C 12 13, 15 15, 15.5 20" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 13.5 C 18 13, 21 14.5, 21.5 18" />
    </svg>
  ),
  Inbox: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13 L7 5 L17 5 L21 13" />
      <path d="M3 13 L3 19 L21 19 L21 13" />
      <path d="M3 13 L8 13 L9.5 15.5 L14.5 15.5 L16 13 L21 13" />
    </svg>
  ),
  Chart: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 20 L4 4" />
      <path d="M4 20 L20 20" />
      <path d="M7 16 L11 11 L14 14 L19 7" />
    </svg>
  ),
  Settings: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3 L12 5 M12 19 L12 21 M3 12 L5 12 M19 12 L21 12 M5.6 5.6 L7 7 M17 17 L18.4 18.4 M5.6 18.4 L7 17 M17 7 L18.4 5.6" />
    </svg>
  ),
  Search: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20 L16 16" />
    </svg>
  ),
  ArrowRight: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12 L19 12" />
      <path d="M13 6 L19 12 L13 18" />
    </svg>
  ),
  ArrowLeft: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12 L5 12" />
      <path d="M11 6 L5 12 L11 18" />
    </svg>
  ),
  Close: ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5 L19 19 M19 5 L5 19" />
    </svg>
  ),
  Check: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12 L10 17 L20 7" />
    </svg>
  ),
  Phone: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4 L9 4 L10.5 9 L8 10.5 C 9 13, 11 15, 13.5 16 L15 13.5 L20 15 L20 19 C 20 19.5, 19.5 20, 19 20 C 11 20, 4 13, 4 5 C 4 4.5, 4.5 4, 5 4 Z" />
    </svg>
  ),
  Mail: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 6 L12 13 L21 6" />
    </svg>
  ),
  Clock: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7 L12 12 L15.5 14" />
    </svg>
  ),
  Pin: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22 C 12 22, 19 14, 19 9 A 7 7 0 0 0 5 9 C 5 14, 12 22, 12 22 Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  Menu: ({ s = 22 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 7 L20 7 M4 12 L20 12 M4 17 L20 17" />
    </svg>
  ),
  Dot: ({ s = 6, color = "#4A6B5C" }) => (
    <svg width={s} height={s} viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill={color} /></svg>
  ),
};

// ---------- Button ----------
const Button = ({ children, variant = "primary", size = "md", onClick, type = "button", className = "", ...rest }) => {
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none disabled:opacity-50";
  const sizes = {
    sm: "h-9 px-4 text-[13px]",
    md: "h-11 px-5 text-[14px]",
    lg: "h-13 px-7 text-[15px]",
  };
  const variants = {
    primary: "bg-[#1C2A24] text-[#F5F1EA] hover:bg-[#2A3D34]",
    moss: "bg-[#4A6B5C] text-[#F5F1EA] hover:bg-[#3D5A4D]",
    ghost: "bg-transparent text-[#1C2A24] border border-[#1C2A24]/20 hover:border-[#1C2A24]/60 hover:bg-[#1C2A24]/[0.03]",
    seal: "bg-[#C4634A] text-[#F5F1EA] hover:bg-[#A85239]",
    quiet: "bg-[#EBE4D6] text-[#1C2A24] hover:bg-[#E0D7C3]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={{ borderRadius: 2 }}
      {...rest}
    >
      {children}
    </button>
  );
};

// ---------- Badge ----------
const Badge = ({ tone = "neutral", children }) => {
  const tones = {
    neutral: { bg: "#EBE4D6", fg: "#1C2A24", dot: "#8B8578" },
    new:     { bg: "#E8EDDF", fg: "#2E4636", dot: "#4A6B5C" },
    contacted:{bg: "#E6DDD0", fg: "#5C4A2E", dot: "#9A7F47" },
    booked:  { bg: "#DCE4DF", fg: "#1C2A24", dot: "#4A6B5C" },
    urgent:  { bg: "#F4DDD5", fg: "#7A2F1C", dot: "#C4634A" },
    closed:  { bg: "#E2E1DC", fg: "#4D4A42", dot: "#8B8578" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase"
      style={{ background: t.bg, color: t.fg, borderRadius: 2, letterSpacing: "0.06em" }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.dot }} />
      {children}
    </span>
  );
};

// ---------- Placeholder imagery ----------
const Placeholder = ({ label, height = 300, tone = "sage" }) => {
  const tones = {
    sage:   { a: "#B8C5B8", b: "#A3B3A3" },
    vellum: { a: "#EBE4D6", b: "#DCD3BF" },
    ink:    { a: "#2A3D34", b: "#1C2A24" },
    clay:   { a: "#D9B9A8", b: "#C29E8A" },
  };
  const t = tones[tone] || tones.sage;
  return (
    <div
      style={{
        height,
        background: `repeating-linear-gradient(135deg, ${t.a} 0 12px, ${t.b} 12px 24px)`,
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 12,
          border: "1px dashed rgba(28,42,36,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 11,
          color: "#1C2A24",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "center",
          padding: 16,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------- Avatar (initials) ----------
const Avatar = ({ name, size = 32, tone }) => {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const palette = ["#4A6B5C", "#C4634A", "#8B6F47", "#5C6F8B", "#6B5C4A", "#4A6B8B"];
  const pick = tone || palette[name.charCodeAt(0) % palette.length];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: pick, color: "#F5F1EA",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 600, letterSpacing: "0.02em",
        fontFamily: "'Inter', sans-serif",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

Object.assign(window, { Enso, Chop, InkRule, Icon, Button, Badge, Placeholder, Avatar });
