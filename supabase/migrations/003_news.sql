-- 003_news.sql
-- news posts with view count RPC

CREATE TABLE news_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  body         TEXT NOT NULL,
  excerpt      TEXT,
  cover_url    TEXT,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category     TEXT DEFAULT 'news'
               CHECK (category IN ('news', 'announcement', 'patch', 'strategy', 'event')),
  game_id      UUID REFERENCES games(id) ON DELETE SET NULL,
  tags         TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_pinned    BOOLEAN DEFAULT FALSE,
  views        INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- RPC: increment view count atomically (called from server action, not directly from client)
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE news_posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
