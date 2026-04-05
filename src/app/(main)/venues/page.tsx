import { createClient } from '@/lib/supabase/server'

export default async function VenuesPage() {
  const supabase = await createClient()

  const { data: places } = await supabase
    .from('places')
    .select('id, name, address')
    .order('name', { ascending: true })

  const { data: matchCounts } = await supabase
    .from('matches')
    .select('place_id')
    .is('deleted_at', null)

  const countMap: Record<string, number> = {}
  for (const m of matchCounts ?? []) {
    countMap[m.place_id] = (countMap[m.place_id] ?? 0) + 1
  }

  const venues = (places ?? []).map((place) => ({
    ...place,
    matchCount: countMap[place.id] ?? 0,
  }))

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">구장</h1>
      {venues.length === 0 ? (
        <p className="text-sm text-zinc-400">등록된 구장이 없습니다.</p>
      ) : (
        <div className="divide-y">
          {venues.map((venue) => (
            <div key={venue.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{venue.name}</p>
                <p className="mt-0.5 text-sm text-zinc-500">{venue.address}</p>
              </div>
              <span className="shrink-0 text-sm font-medium text-zinc-400">
                {venue.matchCount}회
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
