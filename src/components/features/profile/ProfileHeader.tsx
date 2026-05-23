'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AvatarUpload } from './AvatarUpload'
import { updateProfile } from '@/app/(protected)/profile/actions'

type ProfileRole = 'member' | 'moderator' | 'admin'

interface ProfileHeaderProps {
  profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    discord_tag: string | null
    role: ProfileRole
    created_at: string
  }
  isOwner: boolean
}

export function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(fd)
      if ('error' in result) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  const joinedYear = new Date(profile.created_at).getFullYear()
  const roleBadgeVariant: Record<ProfileRole, 'admin' | 'moderator' | 'member'> = {
    admin: 'admin',
    moderator: 'moderator',
    member: 'member',
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {isOwner ? (
        <AvatarUpload
          currentUrl={profile.avatar_url}
          displayName={profile.display_name}
          username={profile.username}
        />
      ) : (
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--border)]">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" sizes="96px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[var(--bg-elevated)] text-2xl font-bold text-[var(--accent-primary)]">
              {(profile.display_name ?? profile.username).slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      )}

      <div className="flex-1">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Display Name</label>
              <input
                name="display_name"
                defaultValue={profile.display_name ?? ''}
                maxLength={32}
                placeholder={profile.username}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Bio</label>
              <textarea
                name="bio"
                defaultValue={profile.bio ?? ''}
                maxLength={500}
                rows={3}
                placeholder="Tell people about yourself..."
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Discord Tag</label>
              <input
                name="discord_tag"
                defaultValue={profile.discord_tag ?? ''}
                maxLength={64}
                placeholder="username#0000"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={isPending}>Save</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(false); setError(null) }}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {profile.display_name ?? profile.username}
              </h1>
              <Badge variant={roleBadgeVariant[profile.role]}>{profile.role}</Badge>
            </div>
            <p className="mb-1 text-sm text-[var(--text-muted)]">@{profile.username}</p>
            {profile.bio && (
              <p className="mb-2 max-w-lg text-sm text-[var(--text-secondary)]">{profile.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
              {profile.discord_tag && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.036.05a19.926 19.926 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .036-.05c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  {profile.discord_tag}
                </span>
              )}
              <span>Member since {joinedYear}</span>
            </div>
            {isOwner && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
