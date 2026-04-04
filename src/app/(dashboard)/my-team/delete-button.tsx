'use client'

import { Button } from '@/components/ui/button'
import { deleteTeam } from '@/lib/actions/team'

export function DeleteTeamButton({ teamId }: { teamId: string }) {
  const handleDelete = async () => {
    if (!confirm('정말 팀을 삭제하시겠습니까?')) return
    await deleteTeam(teamId)
  }

  return (
    <Button variant="destructive" onClick={handleDelete}>
      삭제
    </Button>
  )
}
