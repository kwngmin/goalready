import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GENDER_LABELS, AGE_GROUP_LABELS } from "@/lib/constants";
import { ActivityGrass } from "@/components/ActivityGrass";
import { ActivityFeed, type ActivityItem } from "@/components/ActivityFeed";
import { DeleteTeamButton } from "@/app/(dashboard)/my-team/delete-button";

const btnIcon =
  "flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!team) notFound();

  const isOwner = user?.id === team.admin_id;

  // 활동 기록 (장소 + 사진 포함)
  const { data: matches } = await supabase
    .from("matches")
    .select("*, places(*), photos(*)")
    .eq("team_id", id)
    .is("deleted_at", null)
    .order("played_at", { ascending: false });

  const activities: ActivityItem[] = (matches ?? []).map((m) => ({
    ...m,
    place: m.places as unknown as ActivityItem["place"],
    photos: ((m.photos as unknown as ActivityItem["photos"]) ?? [])
      .filter((p) => !p.deleted_at)
      .sort((a, b) => a.display_order - b.display_order),
  }));

  // 잔디용 날짜별 횟수 맵
  const activityMap: Record<string, number> = {};
  for (const a of activities) {
    activityMap[a.played_at] = (activityMap[a.played_at] ?? 0) + 1;
  }

  const createdDate = new Date(team.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      {/* 상단: 58rem 이하에서만 좌우 패딩이 0~16px 범위로 유동 */}
      <div className="space-y-8 px-[clamp(0px,calc((58rem-100vw)/2),16px)]">
        {/* 팀 프로필 그룹 */}
        <div className="flex flex-col min-[56rem]:gap-6 min-[56rem]:flex-row relative">
          {team.logo_url && (
            <img
              src={team.logo_url}
              alt=""
              className="h-40 w-40 shrink-0 self-center rounded-full object-cover min-[56rem]:h-52 min-[56rem]:w-52 min-[56rem]:self-auto"
            />
          )}
          <div className="flex-1 space-y-4">
            <div className="">
              <div className="max-[56rem]:absolute flex top-0 right-0 h-9 items-center justify-end gap-1">
                {isOwner && (
                  <>
                    <Link href="/my-team/edit" className={btnIcon}>
                      <Pencil size={18} />
                    </Link>
                    <DeleteTeamButton teamId={team.id} iconOnly />
                  </>
                )}
              </div>
              <h1 className="text-2xl font-bold text-center min-[56rem]:text-left">
                {team.name}
              </h1>
              <div className="flex justify-center min-[56rem]:justify-start items-center gap-1.5 text-sm font-normal text-zinc-500">
                {createdDate} 등록 ·{" "}
                {team.status === "active" ? (
                  <span className="text-emerald-600">활성 팀</span>
                ) : (
                  <span className="text-red-600">비활성 팀</span>
                )}
              </div>
            </div>

            <div className="flex items-center rounded-md bg-zinc-100 h-12">
              <div className="flex-1 px-4 text-center text-sm font-medium">
                {GENDER_LABELS[team.gender]}
              </div>
              <span className="h-7 w-px bg-zinc-300" />
              <div className="flex-1 px-4 text-center text-sm font-medium">
                {team.member_count}명
              </div>
              <span className="h-7 w-px bg-zinc-300" />
              <div className="flex-1 px-4 text-center text-sm font-medium">
                {AGE_GROUP_LABELS[team.age_group]}
              </div>
            </div>

            {team.description && (
              <p className="mt-2 text-base text-zinc-600">{team.description}</p>
            )}
          </div>
        </div>

        {/* 인스타그램 */}
        {team.instagram_handle && (
          <a
            href={`https://instagram.com/${team.instagram_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            @{team.instagram_handle}
          </a>
        )}

        <section>
          <ActivityGrass activityMap={activityMap} />
        </section>
      </div>

      {/* 하단: 좌우 패딩 없음 */}
      <div className="mt-8 min-w-[100vw-2rem]">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
