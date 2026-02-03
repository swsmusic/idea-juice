import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo / Brand */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            IdeaJuice
          </h1>
          <p className="text-2xl text-gray-600">
            Your content coach that actually tells you what to change
          </p>
        </div>

        {/* Value Proposition */}
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            Stop guessing what's wrong with your videos. IdeaJuice analyzes your YouTube channel
            and gives you <span className="font-semibold">actionable suggestions</span> to improve
            your views, CTR, and engagement.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Actionable Insights</h3>
            <p className="text-gray-600 text-sm">
              No more dashboards full of numbers. Get specific suggestions you can implement today.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">Pattern Detection</h3>
            <p className="text-gray-600 text-sm">
              Discover what's working (and what's not) across your entire channel.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Quick Setup</h3>
            <p className="text-gray-600 text-sm">
              Connect your YouTube channel in under 2 minutes. Start getting suggestions instantly.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4 justify-center mt-12">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Log In
            </Button>
          </Link>
        </div>

        {/* Social Proof Placeholder */}
        <p className="text-sm text-gray-500 mt-8">
          Trusted by creators who want to grow smarter, not harder.
        </p>
      </div>
    </div>
  );
}
