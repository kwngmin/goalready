import Link from 'next/link'
import type { Team } from '@/types'

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.id}`} className="group flex flex-col items-center text-center">
      <div className="mb-2 h-20 w-20 overflow-hidden rounded-full bg-zinc-100 sm:h-24 sm:w-24">
        {team.logo_url ? (
          <img src={team.logo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-300">
            {team.name.charAt(0)}
          </div>
        )}
      </div>
      <p className="px-2 text-sm font-medium group-hover:underline">{team.name}</p>
    </Link>
  )
}
