export default function ForbiddenPage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center', color: '#f0f0f5', background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#ef4444' }}>403</h1>
      <p>You do not have permission to access this page.</p>
      <a href="/" style={{ color: '#00d4ff', marginTop: '1rem' }}>Go Home</a>
    </main>
  )
}
