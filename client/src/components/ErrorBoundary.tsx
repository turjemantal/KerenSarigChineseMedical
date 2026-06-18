import { Component, type ErrorInfo, type ReactNode } from 'react'

// App-wide safety net: a render error in any view is caught here and shown as a
// friendly fallback instead of unmounting the whole app to a blank white screen.
// The error text is shown so issues are diagnosable rather than silent.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[UI] render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#F5F1EA', color: '#1C2A24' }}>
        <div className="max-w-[420px] text-center">
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 400 }}>משהו השתבש</h1>
          <p className="mt-3" style={{ fontSize: 14, color: '#4A6B5C', lineHeight: 1.7 }}>
            אירעה שגיאה בלתי צפויה. אפשר לרענן ולנסות שוב — הנתונים שלך נשמרו.
          </p>
          <button onClick={() => window.location.reload()}
            className="mt-6 text-[14px] h-10" style={{ background: '#1C2A24', color: '#F5F1EA', borderRadius: 999, padding: '0 24px' }}>
            רענון הדף
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-6 text-left whitespace-pre-wrap" style={{ fontSize: 11, color: '#8B2A15', direction: 'ltr' }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
