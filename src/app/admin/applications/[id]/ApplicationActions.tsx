'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { reviewApplication } from '../actions'

export function ApplicationActions({ id }: { id: string }) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handle(status: 'approved' | 'rejected') {
    setError(null)
    startTransition(async () => {
      const result = await reviewApplication(id, status, notes || undefined)
      if ('error' in result) setError(result.error)
    })
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Review Decision</h2>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Notes (optional)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add a note for the applicant or for internal records..."
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        <Button variant="primary" loading={isPending} onClick={() => handle('approved')}>Approve</Button>
        <Button variant="danger" loading={isPending} onClick={() => handle('rejected')}>Reject</Button>
      </div>
    </div>
  )
}
