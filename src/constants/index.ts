export const ROLES = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const

export const NEWS_CATEGORIES = [
  'news',
  'announcement',
  'patch',
  'strategy',
  'event',
] as const

export const TOURNAMENT_FORMATS = [
  'single_elimination',
  'double_elimination',
  'round_robin',
  'swiss',
] as const

export const TOURNAMENT_STATUSES = [
  'upcoming',
  'registration',
  'ongoing',
  'completed',
  'cancelled',
] as const

export const MATCH_STATUSES = [
  'scheduled',
  'live',
  'completed',
  'forfeit',
] as const

export const APPLICATION_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  GAME_ASSETS: 'game-assets',
} as const

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Games', href: '/games' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Roster', href: '/roster' },
  { label: 'Members', href: '/members' },
  { label: 'Leaderboard', href: '/leaderboard' },
] as const

export const SITE_SETTING_KEYS = [
  'club_name',
  'announcement_banner',
  'registration_open',
  'social_links',
  'club_tagline',
] as const
