'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Channel, Video, Suggestion } from '@/types/database';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    setUser(user);
    await loadData(user.id);
  };

  const loadData = async (userId: string) => {
    setLoading(true);

    try {
      // Load channels
      const { data: channelsData } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', userId);

      if (channelsData) {
        setChannels(channelsData);

        // Load videos for all channels
        const { data: videosData } = await supabase
          .from('videos')
          .select('*')
          .in('channel_id', channelsData.map(c => c.id))
          .order('published_at', { ascending: false })
          .limit(20);

        if (videosData) {
          setVideos(videosData);

          // Load suggestions
          const { data: suggestionsData } = await supabase
            .from('suggestions')
            .select('*')
            .in('video_id', videosData.map(v => v.id))
            .eq('status', 'pending')
            .order('priority', { ascending: false })
            .limit(10);

          if (suggestionsData) {
            setSuggestions(suggestionsData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);

    try {
      // Create Phyllo user and get SDK token
      const response = await fetch('/api/phyllo/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert('Failed to connect: ' + data.error);
        return;
      }

      // Open Phyllo Connect (in production, you'd use the SDK)
      alert('Phyllo Connect would open here. For now, this is a placeholder.');
      
      // In production, after successful connection, sync data
      await handleSync();
    } catch (error: any) {
      alert('Connection failed: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);

    try {
      // Get user's Phyllo ID
      const { data: userData } = await supabase
        .from('users')
        .select('phyllo_user_id')
        .eq('id', user.id)
        .single();

      if (!userData?.phyllo_user_id) {
        alert('Please connect your YouTube channel first');
        return;
      }

      // Sync data from Phyllo
      const response = await fetch('/api/phyllo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phylloUserId: userData.phyllo_user_id,
        }),
      });

      const syncData = await response.json();

      if (syncData.error) {
        alert('Sync failed: ' + syncData.error);
        return;
      }

      // Generate suggestions
      const suggestionsResponse = await fetch('/api/suggestions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const suggestionsData = await suggestionsResponse.json();

      if (suggestionsData.success) {
        alert(`Synced ${syncData.videosStored} videos and generated ${suggestionsData.suggestionsGenerated} suggestions!`);
        await loadData(user.id);
      }
    } catch (error: any) {
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const updateSuggestionStatus = async (suggestionId: string, status: 'implemented' | 'dismissed') => {
    const { error } = await supabase
      .from('suggestions')
      .update({ 
        status,
        implemented_at: status === 'implemented' ? new Date().toISOString() : null,
      })
      .eq('id', suggestionId);

    if (!error) {
      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const channelHealthScore = channels.length > 0 ? 68 : 0; // Placeholder calculation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            IdeaJuice
          </h1>
          <div className="flex gap-2">
            {channels.length > 0 && (
              <Button onClick={handleSync} disabled={syncing} variant="outline">
                {syncing ? 'Syncing...' : 'Sync Data'}
              </Button>
            )}
            <Button onClick={handleLogout} variant="ghost">
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* No connection state */}
        {channels.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to IdeaJuice! 🎉</CardTitle>
              <CardDescription>
                Let's connect your YouTube channel to start getting actionable suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? 'Connecting...' : 'Connect YouTube Channel'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Channel Health Score */}
        {channels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Channel Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{channelHealthScore}/100</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full"
                      style={{ width: `${channelHealthScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {channelHealthScore < 50 && 'Needs significant improvement'}
                    {channelHealthScore >= 50 && channelHealthScore < 75 && 'Room for improvement'}
                    {channelHealthScore >= 75 && 'Doing well!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Suggestions */}
        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🎯 Top Suggestions</CardTitle>
              <CardDescription>
                Actionable recommendations based on your video performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.slice(0, 5).map((suggestion) => (
                <div key={suggestion.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {suggestion.type}
                        </Badge>
                        <Badge variant={suggestion.priority >= 4 ? 'destructive' : 'secondary'}>
                          Priority {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="font-medium">{suggestion.suggestion}</p>
                      {suggestion.reason && (
                        <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateSuggestionStatus(suggestion.id, 'implemented')}
                      >
                        Implement
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSuggestionStatus(suggestion.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Videos */}
        {videos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {videos.slice(0, 10).map((video) => {
                const videoSuggestions = suggestions.filter(s => s.video_id === video.id);
                const avgCtr = 0.05; // Placeholder
                const performance = video.ctr && video.ctr > avgCtr ? 'good' : 'poor';

                return (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={performance === 'good' ? 'text-green-500' : 'text-yellow-500'}>
                          {performance === 'good' ? '✅' : '⚠️'}
                        </span>
                        <h4 className="font-medium">{video.title || 'Untitled'}</h4>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>{video.views?.toLocaleString() || 0} views</span>
                        {video.ctr && <span>{(video.ctr * 100).toFixed(1)}% CTR</span>}
                        {videoSuggestions.length > 0 && (
                          <span className="text-purple-600 font-medium">
                            {videoSuggestions.length} suggestion{videoSuggestions.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
