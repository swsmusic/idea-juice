'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Mock data for testing
  const channels = [
    {
      id: '1',
      channelName: 'Test Creator Channel',
      platform: 'youtube',
    }
  ];

  const videos = [
    {
      id: '1',
      title: 'How to Grow Your YouTube Channel in 2024',
      views: 12500,
      ctr: 0.08,
      channel_id: '1',
    },
    {
      id: '2',
      title: 'My Morning Routine for Maximum Productivity',
      views: 8200,
      ctr: 0.04,
      channel_id: '1',
    },
    {
      id: '3',
      title: 'Best Camera Settings for YouTube Videos',
      views: 15000,
      ctr: 0.06,
      channel_id: '1',
    },
  ];

  const suggestions = [
    {
      id: '1',
      video_id: '2',
      type: 'title',
      suggestion: 'Add a number to your title (e.g., "5 Morning Routines...") to increase CTR',
      reason: 'Titles with numbers tend to get 36% higher CTR',
      priority: 5,
      status: 'pending',
    },
    {
      id: '2',
      video_id: '2',
      type: 'ctr',
      suggestion: 'Your CTR is 20% below channel average - consider a more eye-catching thumbnail',
      reason: 'This video has 4% CTR vs your channel average of 6.5%',
      priority: 4,
    },
    {
      id: '3',
      video_id: '1',
      type: 'length',
      suggestion: 'Videos around 8-12 minutes perform best on your channel - aim for this sweet spot',
      reason: 'Your top performers average 9.5 minutes',
      priority: 3,
    },
  ];

  const handleConnect = async () => {
    setConnecting(true);
    setTimeout(() => {
      alert('Connect feature coming soon! This is just a demo.');
      setConnecting(false);
    }, 1000);
  };

  const handleSync = async () => {
    setSyncing(true);
    setTimeout(() => {
      alert('Sync feature coming soon! This is just demo data.');
      setSyncing(false);
    }, 1500);
  };

  const updateSuggestionStatus = (suggestionId: string, status: 'implemented' | 'dismissed') => {
    alert(`Suggestion ${status}! (Demo mode - not persisted)`);
  };

  const channelHealthScore = 68;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            IdeaJuice
          </h1>
          <div className="flex gap-2">
            <Button onClick={handleSync} disabled={syncing} variant="outline">
              {syncing ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Badge variant="secondary">Demo Mode</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Channel Health Score */}
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

        {/* Top Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Top Suggestions</CardTitle>
            <CardDescription>
              Actionable recommendations based on your video performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion) => (
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

        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos.map((video) => {
              const videoSuggestions = suggestions.filter(s => s.video_id === video.id);
              const avgCtr = 0.065;
              const performance = video.ctr && video.ctr > avgCtr ? 'good' : 'poor';

              return (
                <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={performance === 'good' ? 'text-green-500' : 'text-yellow-500'}>
                        {performance === 'good' ? '✅' : '⚠️'}
                      </span>
                      <h4 className="font-medium">{video.title}</h4>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>{video.views.toLocaleString()} views</span>
                      <span>{(video.ctr * 100).toFixed(1)}% CTR</span>
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
      </main>
    </div>
  );
}
