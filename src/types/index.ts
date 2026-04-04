import type { Database } from "./database";

// 테이블 Row 타입 추출
type Tables = Database["public"]["Tables"];

export type User = Tables["users"]["Row"];
export type UserInsert = Tables["users"]["Insert"];
export type UserUpdate = Tables["users"]["Update"];

export type Team = Tables["teams"]["Row"];
export type TeamInsert = Tables["teams"]["Insert"];
export type TeamUpdate = Tables["teams"]["Update"];

export type Place = Tables["places"]["Row"];
export type PlaceInsert = Tables["places"]["Insert"];

export type Match = Tables["matches"]["Row"];
export type MatchInsert = Tables["matches"]["Insert"];

export type Photo = Tables["photos"]["Row"];
export type PhotoInsert = Tables["photos"]["Insert"];

// Enum 타입
export type UserRole = Database["public"]["Enums"]["user_role"];
export type GenderType = Database["public"]["Enums"]["gender_type"];
export type TeamLevel = Database["public"]["Enums"]["team_level"];
export type TeamStatus = Database["public"]["Enums"]["team_status"];
export type AgeGroup = Database["public"]["Enums"]["age_group"];

// 팀 상세 (매치 기록 + 사진 포함)
export interface TeamDetail extends Team {
  matches: (Match & {
    place: Place;
    photos: Photo[];
  })[];
}

// 카카오맵 장소 검색 결과
export interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  phone: string;
}

// 지도 마커에 표시할 팀 요약 정보
export interface TeamMapMarker {
  id: string;
  name: string;
  region: string;
  gender: GenderType;
  level: TeamLevel;
  memberCount: number;
  isRecruiting: boolean;
  latitude: number;
  longitude: number;
}
