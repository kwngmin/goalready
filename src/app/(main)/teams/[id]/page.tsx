import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GENDER_LABELS, LEVEL_LABELS, LEVEL_DESCRIPTIONS, AGE_GROUP_LABELS } from '@/lib/constants'
import { ActivityGrass } from '@/components/ActivityGrass'
import { ActivityFeed, type ActivityItem } from '@/components/ActivityFeed'
import { DeleteTeamButton } from '@/app/(dashboard)/my-team/delete-button'

const btnIcon = 'flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600'

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!team) notFound()

  const isOwner = user?.id === team.admin_id

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

  const createdDate = new Date(team.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      {/* 상단: 좌우 패딩 있음 */}
      <div className="space-y-8 px-4">
      {/* 팀 프로필 그룹 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
            {team.status === 'active' && <span className="inline-block h-3 w-3 rounded-full bg-emerald-600" />}
            등록일: {createdDate}
          </span>
          {isOwner && (
            <div className="flex gap-1">
              <Link href="/my-team/edit" className={btnIcon}>
                <Pencil size={18} />
              </Link>
              <DeleteTeamButton teamId={team.id} iconOnly />
            </div>
          )}
        </div>

        <div className="rounded-md border">
          <div className="flex items-center gap-4 px-4 py-4">
            {team.logo_url && (
              <img src={team.logo_url} alt="" className="h-20 w-20 rounded-full object-cover" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              <p className="mt-1 text-base font-medium text-zinc-500">
                {LEVEL_LABELS[team.level]} - {LEVEL_DESCRIPTIONS[team.level]}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t py-3 text-center">
            <div>
              <p className="text-sm text-zinc-500">구분</p>
              <p className="mt-1 font-medium">{GENDER_LABELS[team.gender]}</p>
            </div>
            <div className="border-x">
              <p className="text-sm text-zinc-500">인원</p>
              <p className="mt-1 font-medium">{team.member_count}명</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">연령대</p>
              <p className="mt-1 font-medium">{AGE_GROUP_LABELS[team.age_group]}</p>
            </div>
          </div>
        </div>

        {team.description && (
          <div className="rounded-md bg-zinc-100 px-4 py-3">
            <p className="mb-1 text-sm font-medium text-zinc-500">소개</p>
            <p className="text-sm text-zinc-600">{team.description}</p>
          </div>
        )}
      </div>

      {/* 인스타그램 */}
      {team.instagram_handle && (
        <a
          href={`https://instagram.com/${team.instagram_handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          @{team.instagram_handle}
        </a>
      )}

      <section>
        <ActivityGrass activityMap={activityMap} />
      </section>
      </div>

      {/* 하단: 좌우 패딩 없음 */}
      <div className="mt-8">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
