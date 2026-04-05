'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface Venue {
  kakaoPlaceId: string
  name: string
  address: string
  lat: string
  lng: string
}

interface VenueSearchProps {
  defaultVenue?: Venue | null
  onSelect: (venue: Venue) => void
}

export function VenueSearch({ defaultVenue, onSelect }: VenueSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Venue[]>([])
  const [selected, setSelected] = useState<Venue | null>(defaultVenue ?? null)
  const [searching, setSearching] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.kakao?.maps?.services) {
      setReady(true)
      return
    }
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => setReady(true))
    }
  }, [])

  const search = useCallback(() => {
    if (!query.trim() || !ready) return

    setSearching(true)
    const ps = new window.kakao.maps.services.Places()
    ps.keywordSearch(query, (data, status) => {
      setSearching(false)
      if (status === 'OK') {
        setResults(
          data.map((item) => ({
            kakaoPlaceId: item.id,
            name: item.place_name,
            address: item.road_address_name || item.address_name,
            lat: item.y,
            lng: item.x,
          }))
        )
      } else {
        setResults([])
      }
    })
  }, [query, ready])

  const handleSelect = (venue: Venue) => {
    setSelected(venue)
    setResults([])
    setQuery('')
    onSelect(venue)
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div>
          <p className="font-medium">{selected.name}</p>
          <p className="text-sm text-zinc-500">{selected.address}</p>
        </div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="h-9 rounded-lg px-3 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          변경
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="풋살장 이름으로 검색"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              search()
            }
          }}
        />
        <button
          type="button"
          onClick={search}
          className="h-11 shrink-0 rounded-lg bg-zinc-900 px-4 text-sm text-white hover:bg-zinc-700"
        >
          {searching ? '검색중...' : '검색'}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {results.map((venue) => (
            <li key={venue.kakaoPlaceId}>
              <button
                type="button"
                onClick={() => handleSelect(venue)}
                className="w-full px-3 py-2 text-left hover:bg-zinc-50"
              >
                <p className="text-sm font-medium">{venue.name}</p>
                <p className="text-sm text-zinc-500">{venue.address}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
