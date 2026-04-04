import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GENDER_LABELS, LEVEL_LABELS, AGE_GROUP_LABELS } from '@/lib/constants'
import { ActivityGrass } from '@/components/ActivityGrass'
import { ActivityFeed, type ActivityItem } from '@/components/ActivityFeed'

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!team) notFound()

  // 활동 기록 (장소 + 사진 포함)
  const { data: matches } = await supabase
    .from('matches')
    .select('*, places(*), photos(*)')
    .eq('team_id', id)
    .is('deleted_at', null)
    .order('played_at', { ascending: false })

  const activities: ActivityItem[] = (matches ?? []).map((m) => ({
    ...m,
    place: m.places as unknown as ActivityItem['place'],
    photos: ((m.photos as unknown as ActivityItem['photos']) ?? [])
      .filter((p) => !p.deleted_at)
      .sort((a, b) => a.display_order - b.display_order),
  }))

  // 잔디용 날짜별 횟수 맵
  const activityMap: Record<string, number> = {}
  for (const a of activities) {
    activityMap[a.played_at] = (activityMap[a.played_at] ?? 0) + 1
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      {/* 팀 프로필 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {team.logo_url && (
              <img src={team.logo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
            )}
            <div className="flex flex-1 items-center justify-between">
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <Badge variant="outline">{LEVEL_LABELS[team.level]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {team.description && (
            <p className="text-zinc-600">{team.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-500">인원</span>
              <p>{team.member_count}명</p>
            </div>
            <div>
              <span className="text-zinc-500">구분</span>
              <p>{GENDER_LABELS[team.gender]}</p>
            </div>
            <div>
              <span className="text-zinc-500">연령대</span>
              <p>{AGE_GROUP_LABELS[team.age_group]}</p>
            </div>
            <div>
              <span className="text-zinc-500">인스타그램</span>
              <a
                href={`https://instagram.com/${team.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @{team.instagram_handle}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 잔디 */}
      <section>
        <h2 className="mb-4 text-lg font-bold">활동 잔디</h2>
        <ActivityGrass activityMap={activityMap} />
      </section>

      {/* 활동 기록 피드 */}
      <section>
        <h2 className="mb-4 text-lg font-bold">활동 기록</h2>
        <ActivityFeed activities={activities} />
      </section>
    </div>
  )
}
