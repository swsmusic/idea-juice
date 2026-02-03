import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  generateVideoSuggestions,
  generateTimingSuggestions,
  generateLengthSuggestions,
} from '@/lib/suggestions';
import type { Video, Channel } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get user's channels
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId);

    if (channelsError || !channels || channels.length === 0) {
      return NextResponse.json(
        { error: 'No channels found for user' },
        { status: 404 }
      );
    }

    let totalSuggestions = 0;

    // Process each channel
    for (const channel of channels as Channel[]) {
      // Get all videos for this channel
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('channel_id', channel.id)
        .order('published_at', { ascending: false });

      if (videosError || !videos || videos.length === 0) {
        continue;
      }

      const videoList = videos as Video[];

      // Calculate channel averages
      const validVideos = videoList.filter(v => v.views && v.ctr && v.avg_view_duration);
      const channelAverage = {
        avgViews: validVideos.reduce((sum, v) => sum + (v.views || 0), 0) / validVideos.length,
        avgCtr: validVideos.reduce((sum, v) => sum + (v.ctr || 0), 0) / validVideos.length,
        avgDuration: validVideos.reduce((sum, v) => sum + (v.avg_view_duration || 0), 0) / validVideos.length,
      };

      // Generate suggestions for each video
      for (const video of videoList) {
        const suggestions = generateVideoSuggestions(video, channelAverage);

        // Store suggestions in database
        for (const suggestion of suggestions) {
          const { error: suggestionError } = await supabase
            .from('suggestions')
            .insert({
              video_id: video.id,
              type: suggestion.type,
              suggestion: suggestion.suggestion,
              reason: suggestion.reason,
              priority: suggestion.priority,
              status: 'pending',
            });

          if (!suggestionError) {
            totalSuggestions++;
          }
        }
      }

      // Generate channel-wide suggestions
      const timingSuggestions = generateTimingSuggestions(videoList);
      const lengthSuggestions = generateLengthSuggestions(videoList);

      // Store channel-wide suggestions (attach to most recent video)
      const recentVideo = videoList[0];
      if (recentVideo) {
        for (const suggestion of [...timingSuggestions, ...lengthSuggestions]) {
          const { error: suggestionError } = await supabase
            .from('suggestions')
            .insert({
              video_id: recentVideo.id,
              type: suggestion.type,
              suggestion: suggestion.suggestion,
              reason: suggestion.reason,
              priority: suggestion.priority,
              status: 'pending',
            });

          if (!suggestionError) {
            totalSuggestions++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      suggestionsGenerated: totalSuggestions,
    });
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
