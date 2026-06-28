import { Icon } from './icons'
import { buildGoogleCalendarUrl } from '../utils/calendarLink'

// A styled "Add to Google Calendar" link (opens a pre-filled Google Calendar event in a
// new tab). Shared by the booking confirmation screen and the client portal so the look
// stays identical on mobile and web. `date` is YYYY-MM-DD, `time` is HH:MM.
export function AddToCalendarButton({ date, time, className = '' }: { date: string; time: string; className?: string }) {
  return (
    <a
      href={buildGoogleCalendarUrl(date, time)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 bg-white hover:bg-[#F5F1EA] hover:shadow-sm active:scale-[0.98] ${className}`}
      style={{
        border: '1px solid rgba(28,42,36,0.18)',
        borderRadius: 999,
        padding: '9px 18px',
        fontSize: 13.5,
        fontWeight: 500,
        color: '#2A3D34',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
    >
      <Icon.GoogleG s={18} />
      <span>הוסף ליומן Google</span>
    </a>
  )
}
