// Phyllo API types
export interface PhylloUser {
  id: string;
  name: string;
  external_id: string;
  work_platform_id: string | null;
  created_at: string;
}

export interface PhylloAccount {
  id: string;
  user_id: string;
  work_platform: {
    id: string;
    name: string;
  };
  platform_username: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  created_at: string;
  updated_at: string;
}

export interface PhylloContent {
  id: string;
  platform: string;
  platform_content_id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  published_at: string;
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  performance_metrics: {
    ctr?: number;
    avg_view_duration?: number;
    avg_view_percentage?: number;
  };
}

export interface PhylloSdkConfig {
  clientId: string;
  environment: 'sandbox' | 'production';
  userId: string;
  token: string;
}
