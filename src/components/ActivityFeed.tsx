'use client'

import type { Match, Place, Photo } from '@/types'

export interface ActivityItem extends Match {
  place: Place
  photos: Photo[]
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-zinc-400">아직 활동 기록이 없습니다.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {activities.map((activity) => {
        const thumbnail = activity.photos[0]?.image_url
        return (
          <div key={activity.id} className="group relative aspect-square overflow-hidden bg-zinc-100">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
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
  )
}
