import { createClient } from '@/lib/supabase/server'
import { TeamCard } from '@/components/TeamCard'

export default async function TeamsPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .is('deleted_at', null)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">풋살팀 목록</h1>
      {!teams || teams.length === 0 ? (
        <p className="text-zinc-500">등록된 팀이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}
