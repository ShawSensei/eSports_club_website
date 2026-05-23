'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { updateSiteSettings } from './actions'

interface SettingsFormProps {
  defaults: {
    club_name: string
    tagline: string
    club_description: string
    announcement_enabled: boolean
    announcement_text: string
    discord_url: string
    twitter_url: string
    youtube_url: string
  }
}

export function SettingsForm({ defaults }: SettingsFormProps) {
  const [announcementEnabled, setAnnouncementEnabled] = useState(defaults.announcement_enabled)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    fd.set('announcement_enabled', announcementEnabled ? 'true' : 'false')
    startTransition(async () => {
      const result = await updateSiteSettings(fd)
      if ('error' in result) {
        setError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  const inputClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Club Info">
        <Field label="Club Name">
          <input name="club_name" defaultValue={defaults.club_name} maxLength={100} className={inputClass} />
        </Field>
        <Field label="Tagline">
          <input name="tagline" defaultValue={defaults.tagline} maxLength={200} className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea name="club_description" defaultValue={defaults.club_description} rows={3} maxLength={500} className={`${inputClass} resize-none`} />
        </Field>
      </Section>

      <Section title="Announcement Banner">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={announcementEnabled}
            onClick={() => setAnnouncementEnabled(v => !v)}
            className={`relative h-6 w-11 rounded-full transition ${announcementEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${announcementEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-[var(--text-secondary)]">{announcementEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        {announcementEnabled && (
          <Field label="Banner Text">
            <input name="announcement_text" defaultValue={defaults.announcement_text} maxLength={300} className={inputClass} />
          </Field>
        )}
      </Section>

      <Section title="Social Links">
        <Field label="Discord Invite URL">
          <input name="discord_url" type="url" defaultValue={defaults.discord_url} className={inputClass} placeholder="https://discord.gg/..." />
        </Field>
        <Field label="Twitter/X URL">
          <input name="twitter_url" type="url" defaultValue={defaults.twitter_url} className={inputClass} placeholder="https://twitter.com/..." />
        </Field>
        <Field label="YouTube URL">
          <input name="youtube_url" type="url" defaultValue={defaults.youtube_url} className={inputClass} placeholder="https://youtube.com/..." />
        </Field>
      </Section>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Settings saved successfully.</p>}

      <Button type="submit" loading={isPending}>Save Settings</Button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-primary)]">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
    </div>
  )
}
