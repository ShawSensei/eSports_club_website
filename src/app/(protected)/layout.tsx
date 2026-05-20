// Protected layout — auth check enforced in middleware + here in Phase 2.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
