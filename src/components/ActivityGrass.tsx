'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'

interface ActivityGrassProps {
  activityMap: Record<string, number>
}

const CELL_SIZE = 13
const CELL_GAP = 2
const GRID_HEIGHT = 7 * CELL_SIZE + 6 * CELL_GAP
const MONTH_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

function getMonthlyColor(count: number): string {
  if (count === 0) return 'bg-zinc-100'
  if (count === 1) return 'bg-emerald-200'
  if (count === 2) return 'bg-emerald-400'
  return 'bg-emerald-600'
}

export function ActivityGrass({ activityMap }: ActivityGrassProps) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  // 주간별 집계
  const weeklyCounts = useMemo(() => {
    const result: { label: string; count: number; monthIndex: number }[] = []
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    const cursor = new Date(start)
    const dayOfWeek = cursor.getDay()
    if (dayOfWeek !== 1) {
      cursor.setDate(cursor.getDate() - ((dayOfWeek + 6) % 7))
    }

    while (cursor <= end) {
      const weekStart = new Date(cursor)
      const weekEnd = new Date(cursor)
      weekEnd.setDate(weekEnd.getDate() + 6)

      // 주의 대표 월 = 목요일 기준
      const thursday = new Date(cursor)
      thursday.setDate(thursday.getDate() + 3)
      const monthIndex = thursday.getFullYear() === year ? thursday.getMonth() : weekStart.getMonth()

      let count = 0
      const dayCursor = new Date(weekStart)
      for (let d = 0; d < 7; d++) {
        const dateStr = dayCursor.toISOString().split('T')[0]
        if (dateStr.startsWith(`${year}`)) {
          count += activityMap[dateStr] ?? 0
        }
        dayCursor.setDate(dayCursor.getDate() + 1)
      }

      const startMonth = weekStart.getMonth() + 1
      const startDay = weekStart.getDate()
      const endMonth = weekEnd.getMonth() + 1
      const endDay = weekEnd.getDate()
      const label = startMonth === endMonth
        ? `${startMonth}/${startDay}~${endDay}`
        : `${startMonth}/${startDay}~${endMonth}/${endDay}`

      result.push({ label, count, monthIndex })
      cursor.setDate(cursor.getDate() + 7)
    }
    return result
  }, [activityMap, year])

  const yearCount = Object.entries(activityMap)
    .filter(([date]) => date.startsWith(`${year}`))
    .reduce((sum, [, count]) => sum + count, 0)

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="min-w-[4.5rem] text-xl font-bold">{year}년</span>
          <button type="button" onClick={() => setYear(year - 1)} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-100">
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => setYear(year + 1)}
            disabled={year >= currentYear}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-100 disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>
          {year !== currentYear && (
            <button
              type="button"
              onClick={() => setYear(currentYear)}
              className="ml-1 h-9 rounded-full border px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
            >
              올해
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Minus size={18} />
          <span className="inline-block h-4 w-4 rounded-[2px] bg-zinc-100" />
          <span className="inline-block h-4 w-4 rounded-[2px] bg-emerald-200" />
          <span className="inline-block h-4 w-4 rounded-[2px] bg-emerald-400" />
          <span className="inline-block h-4 w-4 rounded-[2px] bg-emerald-600" />
          <Plus size={18} />
        </div>
      </div>

      {(() => {
        const monthlyGroups: { month: number; weeks: typeof weeklyCounts }[] = []
        for (const week of weeklyCounts) {
          const last = monthlyGroups[monthlyGroups.length - 1]
          if (last && last.month === week.monthIndex) {
            last.weeks.push(week)
          } else {
            monthlyGroups.push({ month: week.monthIndex, weeks: [week] })
          }
        }
        const maxWeeks = Math.max(...monthlyGroups.map((g) => g.weeks.length))
        const weeklyCellH = Math.floor((GRID_HEIGHT - (maxWeeks - 1) * CELL_GAP) / maxWeeks)

        return (
          <div className="px-4 py-3">
            <div className="flex" style={{ gap: CELL_GAP * 2 }}>
              <div className="mr-2 flex flex-col items-end" style={{ gap: CELL_GAP }}>
                <span className="mb-1 text-sm invisible" aria-hidden>0주</span>
                {Array.from({ length: maxWeeks }).map((_, i) => (
                  <span key={i} className="text-sm text-zinc-400" style={{ height: weeklyCellH, lineHeight: `${weeklyCellH}px` }}>
                    {i + 1}주
                  </span>
                ))}
              </div>
              {monthlyGroups.map((group, gi) => (
                <div key={gi} className="flex flex-1 flex-col items-center" style={{ gap: CELL_GAP }}>
                  <span className="mb-1 text-sm text-zinc-400">{MONTH_NAMES[group.month]}</span>
                  {group.weeks.map((week, wi) => (
                    <button
                      key={wi}
                      type="button"
                      title={`${week.label}: ${week.count}회`}
                      className={`w-full rounded-[2px] transition-transform hover:scale-110 ${getMonthlyColor(week.count)}`}
                      style={{ height: weeklyCellH }}
                    />
                  ))}
                  {Array.from({ length: maxWeeks - group.weeks.length }).map((_, i) => (
                    <span key={`empty-${i}`} style={{ height: weeklyCellH }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
