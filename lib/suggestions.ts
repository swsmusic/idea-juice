import type { Video, Suggestion } from '@/types/database';

export interface SuggestionInput {
  type: Suggestion['type'];
  suggestion: string;
  reason: string;
  priority: number;
}

// Generate suggestions for a single video
export function generateVideoSuggestions(
  video: Video,
  channelAverage: {
    avgViews: number;
    avgCtr: number;
    avgDuration: number;
  }
): SuggestionInput[] {
  const suggestions: SuggestionInput[] = [];

  // Title optimization
  if (video.title) {
    if (video.title.length > 60) {
      suggestions.push({
        type: 'title',
        suggestion: `Shorten title to under 60 characters (currently ${video.title.length})`,
        reason: 'YouTube truncates titles over 60 characters in search results, reducing click-through rate.',
        priority: 3,
      });
    }

    // Check for numbers (proven to increase CTR)
    if (!/\d/.test(video.title)) {
      suggestions.push({
        type: 'title',
        suggestion: 'Consider adding a number to your title (e.g., "5 Reasons...", "The #1 Way...")',
        reason: 'Videos with numbers in titles get 15% higher CTR on average.',
        priority: 2,
      });
    }

    // Check for power words
    const powerWords = ['how to', 'why', 'secret', 'ultimate', 'complete', 'guide'];
    const hasPowerWord = powerWords.some(word => 
      video.title?.toLowerCase().includes(word)
    );
    
    if (!hasPowerWord) {
      suggestions.push({
        type: 'title',
        suggestion: 'Try using engaging words like "How to", "Why", "Ultimate Guide", or "Secret"',
        reason: 'These phrases are proven to increase click-through rates.',
        priority: 2,
      });
    }
  }

  // CTR analysis
  if (video.ctr !== null && channelAverage.avgCtr > 0) {
    const ctrRatio = video.ctr / channelAverage.avgCtr;
    
    if (ctrRatio < 0.5) {
      suggestions.push({
        type: 'ctr',
        suggestion: 'Low CTR detected - consider changing thumbnail and title',
        reason: `CTR is ${(video.ctr * 100).toFixed(1)}% vs channel average of ${(channelAverage.avgCtr * 100).toFixed(1)}%`,
        priority: 5,
      });
    } else if (ctrRatio > 1.5) {
      suggestions.push({
        type: 'ctr',
        suggestion: 'High performer! Analyze what worked here and replicate in future videos',
        reason: `CTR is ${(ctrRatio * 100).toFixed(0)}% above your average - this thumbnail/title combo works!`,
        priority: 1,
      });
    }
  }

  // Watch time / retention
  if (video.avg_view_duration !== null && channelAverage.avgDuration > 0) {
    const durationRatio = video.avg_view_duration / channelAverage.avgDuration;
    
    if (durationRatio < 0.3) {
      suggestions.push({
        type: 'hook',
        suggestion: 'Poor retention in first 30 seconds - your hook needs work',
        reason: `Viewers drop off quickly (${(durationRatio * 100).toFixed(0)}% retention vs ${(channelAverage.avgDuration * 100).toFixed(0)}% average)`,
        priority: 4,
      });
    } else if (durationRatio > 0.6) {
      suggestions.push({
        type: 'hook',
        suggestion: 'Strong hook! Use similar opening pattern in future videos',
        reason: `Above-average retention (${(durationRatio * 100).toFixed(0)}% vs ${(channelAverage.avgDuration * 100).toFixed(0)}% average)`,
        priority: 1,
      });
    }
  }

  // Thumbnail check
  if (!video.thumbnail_url || video.thumbnail_url.includes('default')) {
    suggestions.push({
      type: 'thumbnail',
      suggestion: 'Add a custom thumbnail - videos without custom thumbnails get 50% fewer views',
      reason: 'Auto-generated thumbnails perform poorly compared to custom designs.',
      priority: 5,
    });
  }

  // Views comparison
  if (video.views !== null && channelAverage.avgViews > 0) {
    const viewRatio = video.views / channelAverage.avgViews;
    
    if (viewRatio < 0.3) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'This video is underperforming - consider updating title/thumbnail or promoting it',
        reason: `Only ${(viewRatio * 100).toFixed(0)}% of your average views`,
        priority: 4,
      });
    }
  }

  return suggestions;
}

// Analyze channel-wide patterns for timing suggestions
export function generateTimingSuggestions(videos: Video[]): SuggestionInput[] {
  const suggestions: SuggestionInput[] = [];

  if (videos.length < 5) {
    return suggestions; // Not enough data
  }

  // Group videos by day of week
  const dayPerformance: Record<number, { views: number; count: number }> = {};
  
  videos.forEach(video => {
    if (!video.published_at || !video.views) return;
    
    const date = new Date(video.published_at);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (!dayPerformance[dayOfWeek]) {
      dayPerformance[dayOfWeek] = { views: 0, count: 0 };
    }
    
    dayPerformance[dayOfWeek].views += video.views;
    dayPerformance[dayOfWeek].count += 1;
  });

  // Find best day
  let bestDay = -1;
  let bestAvg = 0;
  
  Object.entries(dayPerformance).forEach(([day, data]) => {
    const avg = data.views / data.count;
    if (avg > bestAvg && data.count >= 2) {
      bestAvg = avg;
      bestDay = parseInt(day);
    }
  });

  if (bestDay !== -1) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    suggestions.push({
      type: 'timing',
      suggestion: `Your best upload day is ${days[bestDay]} - consider posting consistently on this day`,
      reason: `Videos posted on ${days[bestDay]} average ${bestAvg.toFixed(0)} views vs ${(Object.values(dayPerformance).reduce((sum, d) => sum + d.views, 0) / videos.length).toFixed(0)} overall`,
      priority: 3,
    });
  }

  return suggestions;
}

// Analyze video length patterns
export function generateLengthSuggestions(videos: Video[]): SuggestionInput[] {
  const suggestions: SuggestionInput[] = [];

  if (videos.length < 5) return suggestions;

  // Group by length brackets
  const lengthBrackets: Record<string, { views: number; count: number }> = {
    'short': { views: 0, count: 0 },    // < 5 min
    'medium': { views: 0, count: 0 },   // 5-12 min
    'long': { views: 0, count: 0 },     // > 12 min
  };

  videos.forEach(video => {
    if (!video.avg_view_duration || !video.views) return;
    
    const minutes = video.avg_view_duration / 60;
    let bracket = 'short';
    
    if (minutes > 12) bracket = 'long';
    else if (minutes > 5) bracket = 'medium';
    
    lengthBrackets[bracket].views += video.views;
    lengthBrackets[bracket].count += 1;
  });

  // Find best bracket
  let bestBracket = '';
  let bestAvg = 0;
  
  Object.entries(lengthBrackets).forEach(([bracket, data]) => {
    if (data.count < 2) return;
    const avg = data.views / data.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestBracket = bracket;
    }
  });

  if (bestBracket) {
    const bracketNames = {
      'short': '3-5 minute',
      'medium': '8-12 minute',
      'long': '15+ minute',
    };
    
    suggestions.push({
      type: 'length',
      suggestion: `Your ${bracketNames[bestBracket as keyof typeof bracketNames]} videos perform best - aim for this length`,
      reason: `These videos average ${bestAvg.toFixed(0)} views vs ${(Object.values(lengthBrackets).reduce((sum, d) => sum + d.views, 0) / videos.length).toFixed(0)} overall`,
      priority: 2,
    });
  }

  return suggestions;
}
