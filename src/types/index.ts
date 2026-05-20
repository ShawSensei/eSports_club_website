import type { Database } from './supabase'

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Game = Database['public']['Tables']['games']['Row']
export type UserGame = Database['public']['Tables']['user_games']['Row']
export type NewsPost = Database['public']['Tables']['news_posts']['Row']
export type TeamRoster = Database['public']['Tables']['team_roster']['Row']
export type ClubMember = Database['public']['Tables']['club_members']['Row']
export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type TournamentTeam = Database['public']['Tables']['tournament_teams']['Row']
export type TournamentTeamMember = Database['public']['Tables']['tournament_team_members']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type PlayerStats = Database['public']['Tables']['player_stats']['Row']
export type MembershipApplication = Database['public']['Tables']['membership_applications']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type AuditLog = Database['public']['Tables']['audit_log']['Row']

// Extended types with joins
export type NewsPostWithAuthor = NewsPost & {
  author: Pick<Profile, 'username' | 'avatar_url' | 'display_name'> | null
  game: Pick<Game, 'name' | 'slug'> | null
}

export type TeamRosterWithProfile = TeamRoster & {
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
  game: Pick<Game, 'name' | 'slug' | 'logo_url'>
}

export type TournamentWithGame = Tournament & {
  game: Pick<Game, 'name' | 'slug' | 'logo_url'>
}

export type PlayerStatsWithProfile = PlayerStats & {
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
  game: Pick<Game, 'name' | 'slug'>
}

// Role type
export type Role = 'member' | 'moderator' | 'admin'

// Site settings shape
export interface SiteSettingsData {
  club_name: string
  announcement_banner: { text: string; enabled: boolean }
  registration_open: boolean
  social_links: { discord: string; twitter: string; youtube: string }
  club_tagline?: string
}

// Form state helpers
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string | Record<string, string[]> }
