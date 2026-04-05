'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteTeam } from '@/lib/actions/team'

export function DeleteTeamButton({ teamId, iconOnly }: { teamId: string; iconOnly?: boolean }) {
  const handleDelete = async () => {
    if (!confirm('정말 팀을 삭제하시겠습니까?')) return
    await deleteTeam(teamId)
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleDelete}
        className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500"
      >
        <Trash2 size={18} />
      </button>
    )
  }

  return (
    <Button variant="destructive" onClick={handleDelete}>
      삭제
    </Button>
  )
}
