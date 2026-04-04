import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GENDER_LABELS, LEVEL_LABELS, AGE_GROUP_LABELS } from '@/lib/constants'
import type { Team } from '@/types'

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            {team.logo_url && (
              <img src={team.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            )}
            <div className="flex flex-1 items-center justify-between">
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <Badge variant="outline">{LEVEL_LABELS[team.level]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span>{GENDER_LABELS[team.gender]}</span>
            <span>{AGE_GROUP_LABELS[team.age_group]}</span>
            <span>{team.member_count}명</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
