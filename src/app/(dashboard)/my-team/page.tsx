import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { GENDER_LABELS, LEVEL_LABELS, AGE_GROUP_LABELS } from '@/lib/constants'
import { ActivityGrass } from '@/components/ActivityGrass'
import { LogoutButton } from '@/components/logout-button'

const btnBase = 'inline-flex items-center justify-center rounded-lg text-sm font-medium h-11 px-4'
const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/80`

export default async function MyTeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('nickname, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  const provider = user.app_metadata?.provider ?? ''

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('admin_id', user.id)
    .is('deleted_at', null)
    .single()

  let activityMap: Record<string, number> = {}
  if (team) {
    const { data: matches } = await supabase
      .from('matches')
      .select('played_at')
      .eq('team_id', team.id)
      .is('deleted_at', null)

    for (const m of matches ?? []) {
      activityMap[m.played_at] = (activityMap[m.played_at] ?? 0) + 1
    }
  }

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      {/* 프로필 */}
      <div className="mb-10 flex items-center gap-5">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-2xl text-zinc-400">
            MY
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile?.nickname ?? '풋살러'}</h2>
            {provider === 'kakao' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#FEE500" />
                <path d="M12 6.5c-3.866 0-7 2.462-7 5.5 0 1.97 1.311 3.698 3.292 4.67l-.838 3.08c-.064.236.206.422.412.284l3.68-2.453c.149.01.299.019.454.019 3.866 0 7-2.463 7-5.5s-3.134-5.6-7-5.6z" fill="#3C1E1E" />
              </svg>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
            {joinDate && <span>{joinDate} 가입</span>}
          </div>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* 팀 관리 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">내 팀</h2>
        <Link href="/my-team/new" className={btnPrimary}>
          {team ? '+ 팀 생성' : '팀 등록하기'}
        </Link>
      </div>

      {!team ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-zinc-500">아직 등록된 팀이 없습니다</p>
          <p className="text-sm text-zinc-400">팀을 등록하고 풋살고에서 팀을 알려보세요</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Link href={`/teams/${team.id}`} className="block">
            <div className="flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:border-zinc-400">
              {team.logo_url && (
                <img src={team.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{team.name}</span>
                  <Badge variant="outline">{LEVEL_LABELS[team.level]}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {GENDER_LABELS[team.gender]} · {team.member_count}명 · {AGE_GROUP_LABELS[team.age_group]}
                </p>
              </div>
            </div>
          </Link>

          <section>
            <ActivityGrass activityMap={activityMap} />
          </section>
        </div>
      )}
    </div>
  )
}
