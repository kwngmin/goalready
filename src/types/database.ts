// 이 파일은 Supabase CLI로 자동 생성됩니다.
// 실행: pnpm supabase gen types typescript --linked > src/types/database.ts
//
// 아래는 스키마 기반 예상 타입 (자동 생성 전 개발용)

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          kakao_id: string;
          nickname: string;
          email: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          kakao_id: string;
          nickname: string;
          email?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          kakao_id?: string;
          nickname?: string;
          email?: string | null;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          admin_id: string;
          name: string;
          status: Database["public"]["Enums"]["team_status"];
          description: string | null;
          regions: string[];
          member_count: number;
          age_group: Database["public"]["Enums"]["age_group"];
          gender: Database["public"]["Enums"]["gender_type"];
          level: Database["public"]["Enums"]["team_level"];
          instagram_handle: string;
          kakao_open_chat_url: string | null;
          logo_url: string | null;
          is_recruiting: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          admin_id: string;
          name: string;
          status?: Database["public"]["Enums"]["team_status"];
          description?: string | null;
          regions?: string[];
          member_count?: number;
          age_group?: Database["public"]["Enums"]["age_group"];
          gender?: Database["public"]["Enums"]["gender_type"];
          level?: Database["public"]["Enums"]["team_level"];
          instagram_handle: string;
          kakao_open_chat_url?: string | null;
          logo_url?: string | null;
          is_recruiting?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          admin_id?: string;
          name?: string;
          status?: Database["public"]["Enums"]["team_status"];
          description?: string | null;
          regions?: string[];
          member_count?: number;
          age_group?: Database["public"]["Enums"]["age_group"];
          gender?: Database["public"]["Enums"]["gender_type"];
          level?: Database["public"]["Enums"]["team_level"];
          instagram_handle?: string;
          kakao_open_chat_url?: string | null;
          logo_url?: string | null;
          is_recruiting?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      places: {
        Row: {
          id: string;
          kakao_place_id: string | null;
          name: string;
          address: string;
          address_detail: string | null;
          postal_code: string | null;
          latitude: number;
          longitude: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          kakao_place_id?: string | null;
          name: string;
          address: string;
          address_detail?: string | null;
          postal_code?: string | null;
          latitude: number;
          longitude: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          kakao_place_id?: string | null;
          name?: string;
          address?: string;
          address_detail?: string | null;
          postal_code?: string | null;
          latitude?: number;
          longitude?: number;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          team_id: string;
          place_id: string;
          played_at: string;
          description: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          place_id: string;
          played_at: string;
          description?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          place_id?: string;
          played_at?: string;
          description?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      photos: {
        Row: {
          id: string;
          match_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          image_url: string;
          display_order?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
    };
    Enums: {
      user_role: "manager" | "organizer";
      gender_type: "male" | "female";
      team_level: "beginner" | "amateur" | "semi_pro";
      team_status: "active" | "inactive";
      age_group: "10s" | "20s" | "30s" | "40s" | "50s_plus" | "mixed";
    };
  };
}
