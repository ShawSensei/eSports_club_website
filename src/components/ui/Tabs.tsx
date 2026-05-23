'use client'

import { createContext, useContext, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// ---- Context ----
type TabsCtx = { active: string; setTab: (v: string) => void }
const TabsContext = createContext<TabsCtx>({ active: '', setTab: () => {} })

// ---- Root ----
interface TabsProps {
  defaultValue: string
  syncUrl?: boolean          // if true, syncs with ?tab= searchParam
  paramKey?: string          // default "tab"
  children: React.ReactNode
  className?: string
}

export function Tabs({ defaultValue, syncUrl = false, paramKey = 'tab', children, className }: TabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const active = syncUrl ? (searchParams.get(paramKey) ?? defaultValue) : defaultValue

  const setTab = useCallback(
    (value: string) => {
      if (!syncUrl) return
      const params = new URLSearchParams(searchParams.toString())
      params.set(paramKey, value)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams, syncUrl, paramKey]
  )

  return (
    <TabsContext.Provider value={{ active, setTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

// ---- StateTabs (non-URL, pure state) ----
interface StateTabsProps {
  value: string
  onValueChange: (v: string) => void
  children: React.ReactNode
  className?: string
}

export function StateTabs({ value, onValueChange, children, className }: StateTabsProps) {
  return (
    <TabsContext.Provider value={{ active: value, setTab: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

// ---- List ----
export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex gap-1 rounded-xl p-1', className)}
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}

// ---- Trigger ----
export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, setTab } = useContext(TabsContext)
  const isActive = active === value

  return (
    <button
      onClick={() => setTab(value)}
      className={cn(
        'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
        isActive ? 'shadow-sm' : 'hover:text-white',
        className
      )}
      style={isActive
        ? { background: 'var(--bg-card)', color: 'var(--accent-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
        : { color: 'var(--text-muted)' }
      }
    >
      {children}
    </button>
  )
}

// ---- Content ----
export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext)
  if (active !== value) return null
  return <div className={cn('mt-6', className)}>{children}</div>
}
