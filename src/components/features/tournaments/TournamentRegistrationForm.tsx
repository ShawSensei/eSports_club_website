'use client'

import { useState, useTransition } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerTeam } from '@/app/(public)/tournaments/actions'

const schema = z.object({
  teamName: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters'),
  members: z.array(z.object({ username: z.string().min(1, 'Enter a username') })).min(1),
})
type FormValues = z.infer<typeof schema>

export function TournamentRegistrationForm({ tournamentId, userId }: { tournamentId: string; userId: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { teamName: '', members: [{ username: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'members' })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      setServerError('')
      const fd = new FormData()
      fd.append('tournamentId', tournamentId)
      fd.append('teamName', values.teamName)
      values.members.forEach(m => fd.append('memberUsernames', m.username))

      const result = await registerTeam(fd)
      if ('error' in result) {
        setServerError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-xl p-5" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
        <p className="font-bold" style={{ color: 'var(--accent-success)' }}>✓ Team registered!</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Your registration is pending moderator approval.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      {serverError && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {serverError}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Team Name</label>
        <input
          {...register('teamName')}
          placeholder="Your team name"
          disabled={isPending}
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        {errors.teamName && <p className="mt-1 text-xs" style={{ color: 'var(--accent-danger)' }}>{errors.teamName.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Team Members <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(enter usernames)</span>
        </label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`members.${index}.username`)}
                placeholder={`Username ${index + 1}`}
                disabled={isPending}
                className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                  style={{ border: '1px solid var(--border)', color: 'var(--accent-danger)' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {errors.members && <p className="text-xs" style={{ color: 'var(--accent-danger)' }}>Add at least one member</p>}
        </div>
        {fields.length < 10 && (
          <button
            type="button"
            onClick={() => append({ username: '' })}
            className="mt-2 text-xs font-medium hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            + Add member
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg py-2.5 text-sm font-bold transition-opacity disabled:opacity-60"
        style={{ background: 'var(--accent-primary)', color: '#000' }}
      >
        {isPending ? 'Registering…' : 'Register Team'}
      </button>
    </form>
  )
}
