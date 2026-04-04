import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActivityForm } from './activity-form'

export default async function NewActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('admin_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!team) {
    redirect('/my-team/edit')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">활동 기록 등록</h1>
      <ActivityForm />
    </div>
  )
}
