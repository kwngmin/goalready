import { createClient } from '@/lib/supabase/server'
import { VenueMap } from './venue-map'

export interface VenueMarkerData {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
  totalCount: number
  recentCount: number
}

export default async function MapPage() {
  const supabase = await createClient()

  // 6개월 전 날짜
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0]

  // 풋살장별 누적 활동 횟수
  const { data: allTimeData } = await supabase
    .from('matches')
    .select('place_id, places(id, name, address, latitude, longitude)')
    .is('deleted_at', null)

  // 풋살장별 최근 6개월 활동 횟수
  const { data: recentData } = await supabase
    .from('matches')
    .select('place_id, places(id, name, address, latitude, longitude)')
    .is('deleted_at', null)
    .gte('played_at', sixMonthsAgoStr)

  // 장소별 집계
  const venueMap = new Map<string, VenueMarkerData>()

  for (const match of allTimeData ?? []) {
    const place = match.places as unknown as { id: string; name: string; address: string; latitude: number; longitude: number }
    if (!place) continue
    const existing = venueMap.get(place.id)
    if (existing) {
      existing.totalCount++
    } else {
      venueMap.set(place.id, {
        placeId: place.id,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        totalCount: 1,
        recentCount: 0,
      })
    }
  }

  for (const match of recentData ?? []) {
    const place = match.places as unknown as { id: string; name: string; address: string; latitude: number; longitude: number }
    if (!place) continue
    const existing = venueMap.get(place.id)
    if (existing) {
      existing.recentCount++
    }
  }

  const venues = Array.from(venueMap.values())

  // 가장 최근 활동기록의 장소
  const { data: latestMatch } = await supabase
    .from('matches')
    .select('place_id')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const latestPlaceId = latestMatch?.place_id ?? null

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <VenueMap venues={venues} latestPlaceId={latestPlaceId} />
    </div>
  )
}
