'use client'

import { useEffect, useRef, useState } from 'react'
import type { VenueMarkerData } from './page'

type FilterMode = 'all' | 'recent'

export function VenueMap({ venues }: { venues: VenueMarkerData[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [kakaoLoaded, setKakaoLoaded] = useState(false)

  useEffect(() => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => setKakaoLoaded(true))
    }
  }, [])

  useEffect(() => {
    if (!kakaoLoaded || !mapRef.current) return

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(36.5, 127.5),
      level: 13,
    })

    const filteredVenues = venues.filter((v) =>
      filter === 'all' ? v.totalCount > 0 : v.recentCount > 0
    )

    let openOverlay: kakao.maps.CustomOverlay | null = null

    for (const venue of filteredVenues) {
      const count = filter === 'all' ? venue.totalCount : venue.recentCount
      const position = new window.kakao.maps.LatLng(venue.latitude, venue.longitude)

      // 카운트 마커
      const markerContent = document.createElement('div')
      markerContent.className = 'venue-marker'
      markerContent.innerHTML = `
        <div style="
          display:flex;align-items:center;gap:4px;
          background:white;border:1px solid #d4d4d8;border-radius:20px;
          padding:4px 10px;box-shadow:0 1px 4px rgba(0,0,0,0.1);
          font-size:13px;white-space:nowrap;cursor:pointer;
        ">
          <span style="font-weight:600;">${venue.name}</span>
          <span style="
            background:#18181b;color:white;border-radius:10px;
            padding:1px 7px;font-size:12px;font-weight:600;
          ">${count}</span>
        </div>
      `

      const markerOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: markerContent,
        yAnchor: 1.3,
      })
      markerOverlay.setMap(map)

      // 클릭 시 상세 정보
      const detailContent = document.createElement('div')
      detailContent.innerHTML = `
        <div style="
          background:white;border:1px solid #d4d4d8;border-radius:12px;
          padding:14px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.15);
          font-size:13px;min-width:180px;
        ">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;">${venue.name}</div>
          <div style="color:#71717a;margin-bottom:4px;">${venue.address}</div>
          <div style="color:#18181b;font-weight:600;">활동 ${count}회</div>
          <button id="close-${venue.placeId}" style="
            position:absolute;top:8px;right:10px;background:none;border:none;
            cursor:pointer;font-size:16px;color:#a1a1aa;
          ">&times;</button>
        </div>
      `

      const detailOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: detailContent,
        yAnchor: 1.5,
        zIndex: 10,
      })

      markerContent.addEventListener('click', () => {
        if (openOverlay) openOverlay.setMap(null)
        detailOverlay.setMap(map)
        openOverlay = detailOverlay
      })

      detailContent.querySelector(`#close-${venue.placeId}`)?.addEventListener('click', () => {
        detailOverlay.setMap(null)
        openOverlay = null
      })
    }

    // 지도 클릭 시 오버레이 닫기
    window.kakao.maps.event.addListener(map, 'click', () => {
      if (openOverlay) {
        openOverlay.setMap(null)
        openOverlay = null
      }
    })
  }, [kakaoLoaded, venues, filter])

  return (
    <>
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          누적
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'recent' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          최근 6개월
        </button>
        <span className="ml-2 text-sm text-zinc-400">
          {venues.filter((v) => filter === 'all' ? v.totalCount > 0 : v.recentCount > 0).length}개 풋살장
        </span>
      </div>
      <div ref={mapRef} className="flex-1" />
    </>
  )
}
