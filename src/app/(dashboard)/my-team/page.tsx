import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GENDER_LABELS, LEVEL_LABELS, AGE_GROUP_LABELS } from '@/lib/constants'
import { DeleteTeamButton } from './delete-button'

const btnBase = 'inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4'
const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/80`
const btnOutline = `${btnBase} border border-border bg-background hover:bg-muted hover:text-foreground`

export default async function MyTeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('admin_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!team) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold">아직 등록된 팀이 없습니다</h1>
        <p className="text-zinc-500">팀을 등록하고 풋살고에서 팀을 알려보세요</p>
        <Link href="/my-team/edit" className={btnPrimary}>팀 등록하기</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 팀 관리</h1>
        <div className="flex gap-2">
          <Link href="/my-team/edit" className={btnOutline}>수정</Link>
          <DeleteTeamButton teamId={team.id} />
        </div>
      </div>

      <div className="mb-6">
        <Link href="/my-team/activities/new" className={btnPrimary}>
          활동 기록 등록
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {team.logo_url && (
              <img src={team.logo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            )}
            <div className="flex flex-1 items-center justify-between">
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <Badge variant="outline">{LEVEL_LABELS[team.level]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <p>@{team.instagram_handle}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
