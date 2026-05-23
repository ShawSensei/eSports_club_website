'use client'

import { useState, useEffect } from 'react'

const DISMISS_KEY = 'announcement_dismissed'

export default function AnnouncementBanner({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium"
      style={{ background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))', color: '#000' }}
    >
      <span className="text-center">{text}</span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-black/20 hover:bg-black/30 transition-colors"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}
