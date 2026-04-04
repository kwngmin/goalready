import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamForm } from './team-form'

export default async function EditTeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('admin_id', user.id)
    .is('deleted_at', null)
    .single()

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">
        {team ? '팀 정보 수정' : '팀 등록'}
      </h1>
      <TeamForm team={team ?? undefined} />
    </div>
  )
}
