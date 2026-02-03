import { NextRequest, NextResponse } from 'next/server';
import { getAccounts, getContent } from '@/lib/phyllo';
import { supabase } from '@/lib/supabase';
import type { Channel, Video } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, phylloUserId } = await request.json();

    if (!userId || !phylloUserId) {
      return NextResponse.json(
        { error: 'Missing userId or phylloUserId' },
        { status: 400 }
      );
    }

    // Get connected accounts from Phyllo
    const accounts = await getAccounts(phylloUserId);

    if (accounts.length === 0) {
      return NextResponse.json(
        { message: 'No connected accounts found' },
        { status: 200 }
      );
    }

    let totalVideos = 0;

    // Process each account
    for (const account of accounts) {
      // Store/update channel in database
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .upsert({
          user_id: userId,
          platform: account.work_platform.name.toLowerCase(),
          platform_channel_id: account.id,
          channel_name: account.platform_username,
          phyllo_account_id: account.id,
          last_synced_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (channelError) {
        console.error('Failed to store channel:', channelError);
        continue;
      }

      const channel = channelData as Channel;

      // Get content (videos) from Phyllo
      const content = await getContent(account.id, 30);

      // Store videos in database
      for (const item of content) {
        const videoData: Partial<Video> = {
          channel_id: channel.id,
          platform_video_id: item.platform_content_id,
          title: item.title,
          published_at: item.published_at,
          views: item.engagement.views,
          likes: item.engagement.likes,
          comments: item.engagement.comments,
          ctr: item.performance_metrics?.ctr || null,
          avg_view_duration: item.performance_metrics?.avg_view_duration || null,
          thumbnail_url: item.thumbnail_url,
          analyzed_at: new Date().toISOString(),
        };

        const { error: videoError } = await supabase
          .from('videos')
          .upsert(videoData);

        if (videoError) {
          console.error('Failed to store video:', videoError);
          continue;
        }

        totalVideos++;
      }
    }

    return NextResponse.json({
      success: true,
      accountsProcessed: accounts.length,
      videosStored: totalVideos,
    });
  } catch (error: any) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync data' },
      { status: 500 }
    );
  }
}
