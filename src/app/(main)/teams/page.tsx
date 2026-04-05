import { createClient } from '@/lib/supabase/server'
import { TeamListFilter } from '@/components/TeamListFilter'

export default async function TeamsPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .is('deleted_at', null)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">풋살팀 목록</h1>
      <TeamListFilter teams={teams ?? []} />
    </div>
  )
}
