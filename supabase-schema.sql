-- IdeaJuice Database Schema
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  phyllo_user_id TEXT,
  subscription_tier TEXT DEFAULT 'discovery'
);

-- Channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'youtube', 'tiktok', etc.
  platform_channel_id TEXT NOT NULL,
  channel_name TEXT,
  phyllo_account_id TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  UNIQUE(user_id, platform, platform_channel_id)
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  platform_video_id TEXT NOT NULL,
  title TEXT,
  published_at TIMESTAMPTZ,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  ctr DECIMAL,
  avg_view_duration INTEGER,
  thumbnail_url TEXT,
  analyzed_at TIMESTAMPTZ,
  UNIQUE(channel_id, platform_video_id)
);

-- Suggestions table
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'title', 'thumbnail', 'hook', 'length', etc.
  suggestion TEXT NOT NULL,
  reason TEXT,
  priority INTEGER, -- 1-5
  status TEXT DEFAULT 'pending', -- 'pending', 'implemented', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  implemented_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX idx_channels_user_id ON channels(user_id);
CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_suggestions_video_id ON suggestions(video_id);
CREATE INDEX idx_suggestions_status ON suggestions(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Channels policies
CREATE POLICY "Users can view own channels" ON channels
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own channels" ON channels
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own channels" ON channels
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Videos policies
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (
    channel_id IN (
      SELECT id FROM channels WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own videos" ON videos
  FOR INSERT WITH CHECK (
    channel_id IN (
      SELECT id FROM channels WHERE user_id::text = auth.uid()::text
    )
  );

-- Suggestions policies
CREATE POLICY "Users can view own suggestions" ON suggestions
  FOR SELECT USING (
    video_id IN (
      SELECT v.id FROM videos v
      JOIN channels c ON v.channel_id = c.id
      WHERE c.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own suggestions" ON suggestions
  FOR UPDATE USING (
    video_id IN (
      SELECT v.id FROM videos v
      JOIN channels c ON v.channel_id = c.id
      WHERE c.user_id::text = auth.uid()::text
    )
  );
