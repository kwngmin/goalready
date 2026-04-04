-- ============================================
-- Futsalgo 2.0 - Database Schema
-- 전국 풋살팀 디렉토리 서비스
-- ============================================

-- Enum 타입 정의
CREATE TYPE user_role AS ENUM ('manager', 'organizer');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE team_level AS ENUM ('beginner', 'amateur', 'semi_pro');
CREATE TYPE team_status AS ENUM ('active', 'inactive');
CREATE TYPE age_group AS ENUM ('10s', '20s', '30s', '40s', '50s_plus', 'mixed');

-- ============================================
-- 유저
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kakao_id TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'manager',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 풋살팀
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  status team_status NOT NULL DEFAULT 'active',
  description TEXT,
  regions TEXT[] NOT NULL DEFAULT '{}',
  member_count INT NOT NULL DEFAULT 0,
  age_group age_group NOT NULL DEFAULT 'mixed',
  gender gender_type NOT NULL DEFAULT 'male',
  level team_level NOT NULL DEFAULT 'amateur',
  instagram_handle TEXT NOT NULL,
  kakao_open_chat_url TEXT,
  logo_url TEXT,
  is_recruiting BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_teams_admin_id ON teams(admin_id);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_regions ON teams USING GIN(regions);
CREATE INDEX idx_teams_gender ON teams(gender);
CREATE INDEX idx_teams_level ON teams(level);
CREATE INDEX idx_teams_is_recruiting ON teams(is_recruiting);
CREATE INDEX idx_teams_deleted_at ON teams(deleted_at);

-- ============================================
-- 풋살장 (카카오맵 검색으로 자동 수집, 삭제 없음)
-- ============================================
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kakao_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  address_detail TEXT,
  postal_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_places_location ON places(latitude, longitude);
CREATE INDEX idx_places_kakao_place_id ON places(kakao_place_id);

-- ============================================
-- 매치 기록 (언제, 어디서 공 찼다)
-- ============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE RESTRICT,
  played_at DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_matches_played_at ON matches(played_at);
CREATE INDEX idx_matches_team_played ON matches(team_id, played_at);
CREATE INDEX idx_matches_deleted_at ON matches(deleted_at);

-- ============================================
-- 매치 사진 (1장 이상, 제한 없음)
-- ============================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE RESTRICT,
  image_url TEXT NOT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_photos_match_id ON photos(match_id);
CREATE INDEX idx_photos_deleted_at ON photos(deleted_at);

-- ============================================
-- updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Active 레코드 조회용 뷰 (deleted_at IS NULL)
-- ============================================
CREATE VIEW active_teams AS
SELECT * FROM teams WHERE deleted_at IS NULL;

CREATE VIEW active_matches AS
SELECT * FROM matches WHERE deleted_at IS NULL;

CREATE VIEW active_photos AS
SELECT * FROM photos WHERE deleted_at IS NULL;

-- ============================================
-- 잔디(활동 캘린더) 조회용 뷰
-- ============================================
CREATE VIEW team_monthly_stats AS
SELECT
  team_id,
  DATE_TRUNC('month', played_at) AS month,
  COUNT(*) AS match_count
FROM matches
WHERE deleted_at IS NULL
GROUP BY team_id, DATE_TRUNC('month', played_at);

-- ============================================
-- 히트맵 조회용 뷰
-- ============================================
CREATE VIEW team_place_heatmap AS
SELECT
  m.team_id,
  p.id AS place_id,
  p.name AS place_name,
  p.latitude,
  p.longitude,
  COUNT(*) AS visit_count
FROM matches m
JOIN places p ON m.place_id = p.id
WHERE m.deleted_at IS NULL
GROUP BY m.team_id, p.id, p.name, p.latitude, p.longitude;

-- ============================================
-- 지역 필터 쿼리 예시
-- ============================================
-- 특정 지역에서 활동하는 팀 찾기
-- SELECT * FROM active_teams WHERE regions @> ARRAY['서울 마포구'];
--
-- 여러 지역 중 하나라도 겹치는 팀 찾기
-- SELECT * FROM active_teams WHERE regions && ARRAY['서울 마포구', '서울 용산구'];

-- ============================================
-- [2단계] 댓글 / 대댓글
-- ============================================
-- CREATE TABLE comments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   match_id UUID NOT NULL REFERENCES matches(id) ON DELETE RESTRICT,
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
--   parent_id UUID REFERENCES comments(id) ON DELETE RESTRICT,
--   content TEXT NOT NULL,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   deleted_at TIMESTAMPTZ
-- );
--
-- CREATE INDEX idx_comments_match_id ON comments(match_id);
-- CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- ============================================
-- [2단계] 대회 기능
-- ============================================
-- CREATE TABLE events (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
--   title TEXT NOT NULL,
--   description TEXT,
--   place_id UUID REFERENCES places(id),
--   event_date DATE NOT NULL,
--   registration_deadline DATE,
--   max_teams INT,
--   fee INT DEFAULT 0,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   deleted_at TIMESTAMPTZ
-- );
--
-- CREATE TABLE event_registrations (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
--   team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
--   status TEXT NOT NULL DEFAULT 'pending',
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   deleted_at TIMESTAMPTZ,
--   UNIQUE(event_id, team_id)
-- );
