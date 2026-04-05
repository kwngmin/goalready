'use client'

import { useState } from 'react'
import { Grid3x3, Rows3 } from 'lucide-react'
import type { Match, Place, Photo } from '@/types'

export interface ActivityItem extends Match {
  place: Place
  photos: Photo[]
}

type ViewMode = 'grid' | 'list'

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const [view, setView] = useState<ViewMode>('grid')

  return (
    <div>
      {/* 탭 */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setView('grid')}
          className={`flex h-11 flex-1 items-center justify-center transition-colors ${
            view === 'grid' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400'
          }`}
        >
          <Grid3x3 size={20} />
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          className={`flex h-11 flex-1 items-center justify-center transition-colors ${
            view === 'list' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400'
          }`}
        >
          <Rows3 size={20} />
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-zinc-400">아직 활동 기록이 없습니다.</p>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-3 gap-1">
          {activities.map((activity) => {
            const thumbnail = activity.photos[0]?.image_url
            return (
              <div key={activity.id} className="group relative aspect-square overflow-hidden bg-zinc-100">
                {thumbnail ? (
                  <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-zinc-300">
                    No Photo
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-sm font-medium text-white">{activity.played_at}</p>
                  <p className="mt-1 text-sm text-white/80">{activity.place.name}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="divide-y px-4">
          {activities.map((activity) => {
            const thumbnail = activity.photos[0]?.image_url
            return (
              <div key={activity.id} className="flex items-center gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{activity.played_at}</p>
                  <p className="mt-0.5 text-sm text-zinc-500 truncate">{activity.place.name}</p>
                </div>
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-300">
                      -
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
