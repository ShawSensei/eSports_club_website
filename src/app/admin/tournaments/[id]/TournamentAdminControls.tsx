'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { updateTournamentStatus, toggleRegistration, reviewTeam } from '../actions'

type TournamentStatus = 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'

const STATUS_FLOW: TournamentStatus[] = ['upcoming', 'registration', 'ongoing', 'completed']

interface TournamentAdminControlsProps {
  id: string
  status: TournamentStatus
  registrationOpen: boolean
}

export function TournamentAdminControls({ id, status, registrationOpen }: TournamentAdminControlsProps) {
  const [isPending, startTransition] = useTransition()
  const currentIdx = STATUS_FLOW.indexOf(status)
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null

  return (
    <div className="flex flex-wrap gap-3">
      {nextStatus && (
        <Button
          size="sm"
          loading={isPending}
          onClick={() => startTransition(async () => { await updateTournamentStatus(id, nextStatus) })}
        >
          Advance to {nextStatus}
        </Button>
      )}
      {status !== 'cancelled' && status !== 'completed' && (
        <Button
          variant="danger"
          size="sm"
          loading={isPending}
          onClick={() => startTransition(async () => { await updateTournamentStatus(id, 'cancelled') })}
        >
          Cancel Tournament
        </Button>
      )}
      {status !== 'cancelled' && status !== 'completed' && (
        <Button
          variant="outline"
          size="sm"
          loading={isPending}
          onClick={() => startTransition(async () => { await toggleRegistration(id, registrationOpen) })}
        >
          {registrationOpen ? 'Close Registration' : 'Open Registration'}
        </Button>
      )}
    </div>
  )
}

interface TeamReviewButtonsProps {
  teamId: string
  tournamentId: string
}

export function TeamReviewButtons({ teamId, tournamentId }: TeamReviewButtonsProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        loading={isPending}
        onClick={() => startTransition(async () => { await reviewTeam(teamId, tournamentId, 'approved') })}
      >
        Approve
      </Button>
      <Button
        variant="danger"
        size="sm"
        loading={isPending}
        onClick={() => startTransition(async () => { await reviewTeam(teamId, tournamentId, 'rejected') })}
      >
        Reject
      </Button>
    </div>
  )
}
