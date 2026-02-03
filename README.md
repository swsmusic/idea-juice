# IdeaJuice MVP

A YouTube content optimization tool that gives creators actionable suggestions based on their video performance data.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Next.js API Routes + Convex
- **Database:** Convex (real-time database)
- **Data Aggregation:** Phyllo API (YouTube data)
- **Charts:** Recharts

## Features

### Phase 1: Auth + YouTube Connection ✅
- User signup/login with Supabase Auth
- Phyllo API integration for YouTube OAuth
- Channel connection flow

### Phase 2: Data Sync ✅
- Pull video metrics from Phyllo
- Store in Supabase database
- Daily sync capability

### Phase 3: Suggestion Engine ✅
- Rule-based analysis:
  - Title optimization (length, keywords, numbers)
  - CTR patterns (vs channel average)
  - Watch time/retention analysis
  - Thumbnail checks
  - Upload timing recommendations
  - Video length optimization

### Phase 4: Dashboard ✅
- Channel health score
- Top actionable suggestions
- Recent videos with performance indicators
- Implement/dismiss suggestion tracking

### Phase 5: Polish (TODO)
- [ ] Mobile responsive improvements
- [ ] Loading states refinement
- [ ] Error handling
- [ ] Onboarding flow
- [ ] Deploy to Vercel

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Convex account (free tier available)
- A Phyllo account (sandbox mode is fine for testing)

### 2. Convex Setup

1. Install Convex CLI: `npm install -g convex`
2. Create a new Convex project at [convex.dev](https://convex.dev)
3. Run `npx convex dev` to set up your deployment
4. The deployment URL will be generated (format: `https://[name].convex.cloud`)

### 3. Phyllo Setup

1. Sign up at [getphyllo.com](https://getphyllo.com)
2. Choose "Creator Data" product
3. Get your:
   - Client ID
   - Client Secret
4. Start in sandbox mode for testing

### 4. Environment Variables

Create `.env.local` file:

```bash
# Convex
CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Phyllo
PHYLLO_CLIENT_ID=your_phyllo_client_id
PHYLLO_CLIENT_SECRET=your_phyllo_client_secret
PHYLLO_ENVIRONMENT=sandbox
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

This will run both the Next.js frontend and Convex backend in parallel:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ideajuice/
├── app/
│   ├── api/
│   │   ├── phyllo/
│   │   │   ├── create-user/route.ts
│   │   │   └── sync/route.ts
│   │   └── suggestions/
│   │       └── generate/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── supabase.ts
│   ├── phyllo.ts
│   └── suggestions.ts
├── types/
│   ├── database.ts
│   └── phyllo.ts
└── supabase-schema.sql
```

## Usage Flow

1. **Sign Up** → Create account with email/password
2. **Connect Channel** → Authorize YouTube via Phyllo Connect
3. **Sync Data** → Pull last 30 days of video performance
4. **Get Suggestions** → AI analyzes patterns and generates actionable recommendations
5. **Track Progress** → Mark suggestions as implemented/dismissed
6. **Measure Impact** → See how changes affect your metrics

## Suggestion Types

- **Title Optimization** → Length, keywords, numbers
- **Thumbnail** → Custom vs auto-generated
- **CTR Patterns** → Above/below channel average
- **Hook Quality** → Retention in first 30 seconds
- **Upload Timing** → Best day/time based on patterns
- **Video Length** → Optimal duration for your audience
- **Engagement** → Underperforming videos flagged

## Next Steps (Post-MVP)

- AI-powered suggestions (OpenAI API)
- Multi-platform support (TikTok, Instagram)
- Competitor analysis
- A/B testing framework
- Team accounts
- Payment processing
- Advanced analytics

## Cost Estimate

- Supabase: Free tier (up to 500MB database, 2GB bandwidth)
- Phyllo: Free tier available, then ~$50-100/mo for production
- Vercel: Free tier (hobby projects)
- **Total MVP cost:** <$500 for 90 days

## Success Criteria

- ✅ Connects to YouTube successfully
- ✅ Generates 5-10 suggestions per channel
- ✅ Clean, mobile-responsive dashboard
- ⏳ Deployable to Vercel
- ⏳ Steve uses it weekly
- ⏳ Measurable improvement in 1+ metric

## Support

For issues or questions, contact: [your-email]

---

**Built with ❤️ to help creators grow smarter, not harder.**
