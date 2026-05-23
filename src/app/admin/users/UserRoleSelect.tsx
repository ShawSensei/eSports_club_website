'use client'

import { useTransition } from 'react'
import { changeRole } from './actions'

type Role = 'member' | 'moderator' | 'admin'

interface UserRoleSelectProps {
  userId: string
  currentRole: Role
  isSelf: boolean
}

export function UserRoleSelect({ userId, currentRole, isSelf }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as Role
    startTransition(async () => {
      await changeRole(userId, role)
    })
  }

  if (isSelf) {
    return <span className="text-sm text-[var(--text-muted)] capitalize">{currentRole}</span>
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none disabled:opacity-50"
    >
      <option value="member">member</option>
      <option value="moderator">moderator</option>
      <option value="admin">admin</option>
    </select>
  )
}
