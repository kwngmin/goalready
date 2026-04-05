'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ActivityGrassProps {
  activityMap: Record<string, number>
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const CELL_SIZE = 13
const CELL_GAP = 2
const GRID_HEIGHT = 7 * CELL_SIZE + 6 * CELL_GAP // 일별 기준 높이 (103px)
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function getDailyColor(count: number): string {
  return count > 0 ? 'bg-emerald-600' : 'bg-zinc-100'
}

function getMonthlyColor(count: number): string {
  if (count === 0) return 'bg-zinc-100'
  if (count === 1) return 'bg-emerald-200'
  if (count === 2) return 'bg-emerald-400'
  return 'bg-emerald-600'
}

type ViewMode = 'daily' | 'weekly' | 'monthly'

export function ActivityGrass({ activityMap }: ActivityGrassProps) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('daily')

  const { weeks, months } = useMemo(() => {
    const startDate = new Date(year, 0, 1)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const endDate = new Date(year, 11, 31)

    const weeks: { date: Date; dateStr: string; count: number; inYear: boolean }[][] = []
    const months: { label: string; col: number }[] = []
    let currentWeek: { date: Date; dateStr: string; count: number; inYear: boolean }[] = []
    let lastMonth = -1

    const cursor = new Date(startDate)
    let weekIndex = 0

    while (cursor <= endDate) {
      const month = cursor.getMonth()
      const inYear = cursor.getFullYear() === year

      if (inYear && month !== lastMonth && cursor.getDay() === 0) {
        months.push({ label: MONTH_NAMES[month], col: weekIndex })
        lastMonth = month
      }

      const dateStr = cursor.toISOString().split('T')[0]
      currentWeek.push({
        date: new Date(cursor),
        dateStr,
        count: activityMap[dateStr] ?? 0,
        inYear,
      })

      if (cursor.getDay() === 6) {
        weeks.push(currentWeek)
        currentWeek = []
        weekIndex++
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return { weeks, months }
  }, [activityMap, year])

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

  // 월별 집계
  const monthlyCounts = useMemo(() => {
    const counts = Array(12).fill(0)
    for (const [date, count] of Object.entries(activityMap)) {
      if (date.startsWith(`${year}`)) {
        const month = parseInt(date.split('-')[1], 10) - 1
        counts[month] += count
      }
    }
    return counts
  }, [activityMap, year])

  const yearCount = Object.entries(activityMap)
    .filter(([date]) => date.startsWith(`${year}`))
    .reduce((sum, [, count]) => sum + count, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{year}년</span>
          <button type="button" onClick={() => setYear(year - 1)} className="rounded-md p-1.5 hover:bg-zinc-100">
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setYear(year + 1)}
            disabled={year >= currentYear}
            className="rounded-md p-1.5 hover:bg-zinc-100 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex gap-1 rounded-lg border p-1 text-sm">
          {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${view === mode ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {{ daily: '일별', weekly: '주간', monthly: '월별' }[mode]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: GRID_HEIGHT + 60 }}>
      {view === 'daily' ? (
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* 월 라벨 */}
            <div className="mb-2 flex" style={{ marginLeft: 28 }}>
              {months.map((m, i) => {
                const nextCol = months[i + 1]?.col ?? weeks.length
                const span = nextCol - m.col
                return (
                  <span
                    key={`${m.label}-${m.col}`}
                    className="text-xs text-zinc-400"
                    style={{ width: span * (CELL_SIZE + CELL_GAP), flexShrink: 0 }}
                  >
                    {m.label}
                  </span>
                )
              })}
            </div>

            <div className="flex gap-0.5">
              {/* 요일 라벨 */}
              <div className="flex flex-col" style={{ gap: CELL_GAP, marginRight: 4 }}>
                {DAYS.map((day, i) => (
                  <span
                    key={day}
                    className={`text-xs ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-400'}`}
                    style={{
                      height: CELL_SIZE,
                      lineHeight: `${CELL_SIZE}px`,
                    }}
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* 잔디 셀 */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: CELL_GAP }}>
                  {week.map((day) => (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(day.dateStr === selectedDate ? null : day.dateStr)}
                      title={`${day.dateStr}: ${day.count}회`}
                      className={`rounded-sm transition-transform hover:scale-125 ${
                        day.inYear ? getDailyColor(day.count) : 'bg-transparent'
                      } ${day.dateStr === selectedDate ? 'ring-2 ring-zinc-400' : ''}`}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      disabled={!day.inYear}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
              <p><span className="font-semibold text-zinc-900">{yearCount}회</span> 활동{selectedDate ? ` · ${selectedDate} — ${activityMap[selectedDate] ?? 0}회` : ''}</p>
              <div className="flex items-center gap-1">
                <span>없음</span>
                <span className="inline-block h-3 w-3 rounded-sm bg-zinc-100" />
                <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600" />
                <span>있음</span>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'weekly' ? (
        (() => {
          // 월별로 주간 그룹화
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
            <div>
              <div className="flex" style={{ gap: CELL_GAP * 2 }}>
                {/* 주차 라벨 */}
                <div className="flex flex-col items-end" style={{ gap: CELL_GAP, paddingTop: CELL_SIZE + 6 }}>
                  {Array.from({ length: maxWeeks }).map((_, i) => (
                    <span key={i} className="text-xs text-zinc-400" style={{ height: weeklyCellH, lineHeight: `${weeklyCellH}px` }}>
                      {i + 1}주
                    </span>
                  ))}
                </div>
                {/* 월별 컬럼 */}
                {monthlyGroups.map((group, gi) => (
                  <div key={gi} className="flex flex-1 flex-col items-center" style={{ gap: CELL_GAP }}>
                    <span className="mb-1 text-xs text-zinc-400">{MONTH_NAMES[group.month]}</span>
                    {group.weeks.map((week, wi) => (
                      <button
                        key={wi}
                        type="button"
                        title={`${week.label}: ${week.count}회`}
                        className={`w-full rounded-sm transition-transform hover:scale-110 ${getMonthlyColor(week.count)}`}
                        style={{ height: weeklyCellH }}
                      />
                    ))}
                    {Array.from({ length: maxWeeks - group.weeks.length }).map((_, i) => (
                      <span key={`empty-${i}`} style={{ height: weeklyCellH }} />
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                <p><span className="font-semibold text-zinc-900">{yearCount}회</span> 활동</p>
                <div className="flex items-center gap-1">
                  <span>0회</span>
                  <span className="inline-block h-3 w-3 rounded-sm bg-zinc-100" />
                  <span className="inline-block h-3 w-3 rounded-sm bg-emerald-200" />
                  <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" />
                  <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600" />
                  <span>3+</span>
                </div>
              </div>
            </div>
          )
        })()
      ) : (
        <div>
          {/* 월별 셀 스트립 */}
          <div className="mb-2 flex gap-1.5">
            {MONTH_NAMES.map((name) => (
              <div key={name} className="flex flex-1 items-center justify-center">
                <span className="text-xs text-zinc-400">{name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {MONTH_NAMES.map((name, i) => (
              <span
                key={name}
                className={`flex-1 rounded-sm transition-transform hover:scale-105 ${getMonthlyColor(monthlyCounts[i])}`}
                title={`${name}: ${monthlyCounts[i]}회`}
                style={{ height: GRID_HEIGHT }}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <p><span className="font-semibold text-zinc-900">{yearCount}회</span> 활동</p>
            <div className="flex items-center gap-1">
              <span>0회</span>
              <span className="inline-block h-3 w-3 rounded-sm bg-zinc-100" />
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-200" />
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" />
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600" />
              <span>3+</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
