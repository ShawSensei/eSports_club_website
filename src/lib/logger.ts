/**
 * Central debug logger. Server output uses ANSI colours; browser output uses
 * console styling. info/db are dev-only. error/warn always log.
 *
 * Usage:
 *   log.info('auth', 'login attempt', { email })
 *   log.db('news', 'insert post', { slug })
 *   log.success('auth', 'registered', { userId })
 *   log.warn('roster', 'player already active')
 *   log.error('db', 'insert failed', error)
 */

const isDev = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

// ── ANSI helpers (server only) ────────────────────────────────────────────────
const A = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
} as const

function ts() {
  return `${A.dim}${new Date().toISOString().replace('T', ' ').slice(0, -1)}${A.reset}`
}

function serverPrint(color: string, icon: string, tag: string, msg: string, data?: unknown) {
  const label = `${color}${A.bold}${icon} [${tag.toUpperCase()}]${A.reset}`
  if (data !== undefined) {
    console.log(`${ts()} ${label} ${msg}`, data)
  } else {
    console.log(`${ts()} ${label} ${msg}`)
  }
}

// ── Browser helpers ───────────────────────────────────────────────────────────
function browserPrint(cssColor: string, icon: string, tag: string, msg: string, data?: unknown) {
  const style = `color:${cssColor};font-weight:bold`
  if (data !== undefined) {
    console.log(`%c${icon} [${tag.toUpperCase()}] ${msg}`, style, data)
  } else {
    console.log(`%c${icon} [${tag.toUpperCase()}] ${msg}`, style)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
const log = {
  /** Informational trace — dev only. */
  info(tag: string, msg: string, data?: unknown) {
    if (!isDev) return
    isServer
      ? serverPrint(A.cyan, '●', tag, msg, data)
      : browserPrint('#06b6d4', '●', tag, msg, data)
  },

  /** Database operation trace — dev only. */
  db(tag: string, msg: string, data?: unknown) {
    if (!isDev) return
    isServer
      ? serverPrint(A.magenta, '◆', tag, msg, data)
      : browserPrint('#a855f7', '◆', tag, msg, data)
  },

  /** Successful outcome — always logged. */
  success(tag: string, msg: string, data?: unknown) {
    isServer
      ? serverPrint(A.green, '✓', tag, msg, data)
      : browserPrint('#22c55e', '✓', tag, msg, data)
  },

  /** Non-fatal warning — always logged. */
  warn(tag: string, msg: string, data?: unknown) {
    isServer
      ? serverPrint(A.yellow, '⚠', tag, msg, data)
      : browserPrint('#f59e0b', '⚠', tag, msg, data)
  },

  /** Error — always logged. Accepts Error objects or plain values. */
  error(tag: string, msg: string, data?: unknown) {
    if (isServer) {
      serverPrint(A.red, '✗', tag, msg)
      if (data !== undefined) {
        if (data instanceof Error) {
          console.error(`${A.red}${A.dim}  →${A.reset}`, data.message)
          if (isDev && data.stack) console.error(`${A.dim}${data.stack}${A.reset}`)
        } else {
          console.error(`${A.red}${A.dim}  →${A.reset}`, data)
        }
      }
    } else {
      browserPrint('#ef4444', '✗', tag, msg, data)
    }
  },
}

export default log
