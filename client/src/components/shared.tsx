import React from 'react'

// ---------- Enso brand mark ----------
export const Enso = ({ size = 40, color = '#1C2A24' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M 50 10 A 40 40 0 1 1 20 78" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="2.5" fill="#C4634A" />
  </svg>
)

// ---------- Red chop / seal ----------
export const Chop = ({ char = '醫', size = 64, rotate = -4 }: { char?: string; size?: number; rotate?: number }) => (
  <div style={{
    width: size, height: size, transform: `rotate(${rotate}deg)`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#C4634A', color: '#F5F1EA',
    fontFamily: "'Noto Serif SC', serif", fontSize: size * 0.55, fontWeight: 700,
    boxShadow: 'inset 0 0 0 2px #F5F1EA, inset 0 0 0 4px #C4634A',
    letterSpacing: '-0.05em', lineHeight: 1, paddingBottom: 2,
  }}>
    {char}
  </div>
)

// ---------- Ink rule ----------
export const InkRule = ({ className = '', color = '#1C2A24', opacity = 0.15 }: { className?: string; color?: string; opacity?: number }) => (
  <div className={className} style={{ height: 1, background: color, opacity, width: '100%' }} />
)

// ---------- Button ----------
type ButtonVariant = 'primary' | 'moss' | 'ghost' | 'seal' | 'quiet'
type ButtonSize = 'sm' | 'md' | 'lg'

export const Button = ({
  children, variant = 'primary', size = 'md', onClick, type = 'button', className = '', disabled, ...rest
}: {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none disabled:opacity-50'
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-4 text-[13px]',
    md: 'h-11 px-5 text-[14px]',
    lg: 'h-13 px-7 text-[15px]',
  }
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[#1C2A24] text-[#F5F1EA] hover:bg-[#2A3D34]',
    moss:    'bg-[#4A6B5C] text-[#F5F1EA] hover:bg-[#3D5A4D]',
    ghost:   'bg-transparent text-[#1C2A24] border border-[#1C2A24]/20 hover:border-[#1C2A24]/60',
    seal:    'bg-[#C4634A] text-[#F5F1EA] hover:bg-[#A85239]',
    quiet:   'bg-[#EBE4D6] text-[#1C2A24] hover:bg-[#E0D7C3]',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={{ borderRadius: 2 }}
      {...rest}
    >
      {children}
    </button>
  )
}

// ---------- Placeholder imagery ----------
export const Placeholder = ({ label, height = 300, tone = 'sage' }: { label: string; height?: number; tone?: string }) => {
  const tones: Record<string, { a: string; b: string }> = {
    sage:   { a: '#B8C5B8', b: '#A3B3A3' },
    vellum: { a: '#EBE4D6', b: '#DCD3BF' },
    ink:    { a: '#2A3D34', b: '#1C2A24' },
    clay:   { a: '#D9B9A8', b: '#C29E8A' },
  }
  const t = tones[tone] || tones.sage
  return (
    <div style={{
      height, background: `repeating-linear-gradient(135deg, ${t.a} 0 12px, ${t.b} 12px 24px)`,
      position: 'relative', overflow: 'hidden', borderRadius: 2,
    }}>
      <div style={{
        position: 'absolute', inset: 12, border: '1px dashed rgba(28,42,36,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11, color: '#1C2A24', letterSpacing: '0.12em',
        textTransform: 'uppercase', textAlign: 'center', padding: 16,
      }}>
        {label}
      </div>
    </div>
  )
}

// ---------- Avatar (initials) ----------
export const Avatar = ({ name, size = 32, tone }: { name: string; size?: number; tone?: string }) => {
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  const palette = ['#4A6B5C', '#C4634A', '#8B6F47', '#5C6F8B', '#6B5C4A', '#4A6B8B']
  const pick = tone || palette[name.charCodeAt(0) % palette.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: pick, color: '#F5F1EA',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, letterSpacing: '0.02em',
      fontFamily: "'Inter', sans-serif", flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ---------- Form helpers ----------
export const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11.5, letterSpacing: '0.16em', color: '#4A6B5C', fontWeight: 500 }}>
    {children}
  </div>
)

export const FormField = ({ label, children, required, className = '' }: {
  label: string; children: React.ReactNode; required?: boolean; className?: string
}) => (
  <div className={className}>
    <div className="flex items-center gap-1.5 mb-2">
      <Label>{label}</Label>
      {required && <span style={{ color: '#C4634A', fontSize: 10 }}>*</span>}
    </div>
    {children}
  </div>
)
