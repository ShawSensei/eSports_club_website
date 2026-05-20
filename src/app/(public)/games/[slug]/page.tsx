// Game detail — built out in Phase 5.
export default function GamePage({ params }: { params: { slug: string } }) {
  return <div>Game: {params.slug} — Phase 5</div>
}
