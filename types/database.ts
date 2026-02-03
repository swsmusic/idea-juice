// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  phyllo_user_id: string | null;
  subscription_tier: string;
}

export interface Channel {
  id: string;
  user_id: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  platform_channel_id: string;
  channel_name: string | null;
  phyllo_account_id: string | null;
  connected_at: string;
  last_synced_at: string | null;
}

export interface Video {
  id: string;
  channel_id: string;
  platform_video_id: string;
  title: string | null;
  published_at: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  ctr: number | null;
  avg_view_duration: number | null;
  thumbnail_url: string | null;
  analyzed_at: string | null;
}

export interface Suggestion {
  id: string;
  video_id: string;
  type: 'title' | 'thumbnail' | 'hook' | 'length' | 'timing' | 'ctr' | 'engagement';
  suggestion: string;
  reason: string | null;
  priority: number;
  status: 'pending' | 'implemented' | 'dismissed';
  created_at: string;
  implemented_at: string | null;
}

// Extended types with joins
export interface VideoWithSuggestions extends Video {
  suggestions: Suggestion[];
}

export interface ChannelWithVideos extends Channel {
  videos: Video[];
}
