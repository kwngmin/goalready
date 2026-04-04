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
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{activity.place.name}</p>
              <p className="text-sm text-zinc-500">{activity.place.address}</p>
            </div>
            <time className="shrink-0 text-sm text-zinc-400">{activity.played_at}</time>
          </div>

          {activity.description && (
            <p className="mt-2 text-sm text-zinc-600">{activity.description}</p>
          )}

          {activity.photos.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {activity.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.image_url}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
